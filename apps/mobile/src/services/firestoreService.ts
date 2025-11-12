import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, updateDoc, doc, setDoc, getDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export type PadRequest = {
  id?: string;
  latitude: number;
  longitude: number;
  address?: string;
  ownerId: string;
  acceptorId?: string;
  status: "pending" | "accepted" | "completed" | "cancelled" | "expired";
  urgency?: "urgent" | "normal" | "low";
  empathy?: string;
  createdAt?: any;
};

export type ChatMessage = {
  id?: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

export const addPadRequest = async (
  latitude: number,
  longitude: number,
  address: string | undefined,
  ownerId: string,
  urgency?: "urgent" | "normal" | "low",
  empathy?: string
): Promise<string> => {
  try {
    // Validate inputs
    if (!latitude || !longitude) {
      throw new Error("Invalid location coordinates");
    }
    if (!ownerId || ownerId.trim() === "") {
      throw new Error("Invalid user ID");
    }
    if (!db) {
      throw new Error("Firebase database not initialized");
    }

    const payload: PadRequest = {
      latitude,
      longitude,
      address,
      ownerId,
      status: "pending",
      urgency,
      empathy,
      createdAt: serverTimestamp(),
    };

    console.log("Adding pad request to Firestore:", payload);

    const ref = await addDoc(collection(db, "padRequests"), payload);
    
    if (!ref || !ref.id) {
      throw new Error("Failed to get document reference");
    }

    console.log("Pad request added successfully with ID:", ref.id);
    return ref.id;
  } catch (error: any) {
    console.error("Error adding pad request:", error);
    throw new Error(`Failed to create request: ${error.message || error}`);
  }
};

export const subscribePadRequests = (cb: (items: PadRequest[]) => void) => {
  try {
    if (!db) {
      console.error("Firebase database not initialized");
      cb([]);
      return () => {};
    }

    const q = query(collection(db, "padRequests"), orderBy("createdAt", "desc"));
    
    return onSnapshot(
      q,
      (snap) => {
        try {
          const items: PadRequest[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...(data as Omit<PadRequest, "id">),
            };
          });
          console.log(`Loaded ${items.length} pad requests`);
          cb(items);
        } catch (error) {
          console.error("Error processing snapshot:", error);
          cb([]);
        }
      },
      (error) => {
        console.error("Firebase subscription error:", error);
        cb([]);
      }
    );
  } catch (error) {
    console.error("Error setting up subscription:", error);
    cb([]);
    return () => {};
  }
};

export const acceptRequest = async (reqId: string, acceptorId: string, requesterId: string): Promise<string> => {
  if (!db) {
    throw new Error("Firebase database not initialized");
  }

  // Create matchId (deterministic hash of requestId + helperId)
  // Each helper-requester pair gets a unique match
  const matchId = `${reqId}_${acceptorId}`;
  
  // Check if match already exists
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  
  let threadId: string;
  
  if (matchSnap.exists() && matchSnap.data()?.threadId) {
    // Reuse existing thread (idempotent)
    threadId = matchSnap.data()!.threadId;
  } else {
    // Create new thread with unique ID per helper-requester pair
    // Use matchId as threadId so each helper gets their own chat thread
    threadId = matchId;
    
    // Create thread with type flag
    const threadRef = doc(db, "threads", threadId);
    const threadSnap = await getDoc(threadRef);
    if (!threadSnap.exists()) {
      await setDoc(threadRef, {
        participants: [requesterId, acceptorId],
        type: "human", // Human threads never get bot auto-replies
        requestId: reqId, // Store requestId for reference
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
    }
    
    // Create/update match record
    await setDoc(matchRef, {
      requestId: reqId,
      requesterId,
      helperId: acceptorId,
      threadId,
      status: "active",
      createdAt: serverTimestamp(),
    });
  }
  
  // Update request status
  await updateDoc(doc(db, "padRequests", reqId), {
    status: "matched",
    acceptorId,
  });

  return threadId;
};

/**
 * Cancel a request or help offer
 */
export const cancelRequest = async (
  requestId: string,
  userId: string,
  isRequester: boolean
): Promise<void> => {
  if (!db) {
    throw new Error("Firebase database not initialized");
  }

  const requestRef = doc(db, "padRequests", requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error("Request not found");
  }

  const requestData = requestSnap.data();
  
  // Verify user is authorized to cancel
  if (isRequester && requestData.ownerId !== userId) {
    throw new Error("Unauthorized");
  }
  if (!isRequester && requestData.acceptorId !== userId) {
    throw new Error("Unauthorized");
  }

  // Update request status
  await updateDoc(requestRef, {
    status: "cancelled",
  });

  // If there's a match, update it
  const matchId = `${requestId}_${isRequester ? requestData.acceptorId : requestData.ownerId}`;
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  
  if (matchSnap.exists()) {
    await updateDoc(matchRef, {
      status: "cancelled",
    });
  }
};

/**
 * Mark request as completed (dropped off by helper)
 */
export const markDroppedOff = async (
  requestId: string,
  helperId: string
): Promise<void> => {
  if (!db) {
    throw new Error("Firebase database not initialized");
  }

  const requestRef = doc(db, "padRequests", requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error("Request not found");
  }

  const requestData = requestSnap.data();
  
  // Verify user is the helper
  if (requestData.acceptorId !== helperId) {
    throw new Error("Unauthorized - only the helper can mark as dropped off");
  }

  // Update request status to completed
  await updateDoc(requestRef, {
    status: "completed",
  });

  // Update match status
  const matchId = `${requestId}_${helperId}`;
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  
  if (matchSnap.exists()) {
    await updateDoc(matchRef, {
      status: "completed",
    });
  }
};

export const subscribeMatches = (requesterId: string, cb: (match: { threadId: string; requestId: string; helperId?: string } | null) => void) => {
  try {
    if (!db) {
      console.error("Firebase database not initialized");
      cb(null);
      return () => {};
    }

    // Query matches where requesterId matches and status is active
    const q = query(
      collection(db, "matches"),
      orderBy("createdAt", "desc")
    );
    
    return onSnapshot(
      q,
      (snap) => {
        try {
          // Find the most recent active match for this requester
          // If multiple helpers accept, use the first/most recent one
          for (const docSnap of snap.docs) {
            const data = docSnap.data();
            if (data.requesterId === requesterId && data.status === "active" && data.threadId) {
              cb({
                threadId: data.threadId,
                requestId: data.requestId,
                helperId: data.helperId,
              });
              return; // Return first active match (most recent)
            }
          }
          cb(null);
        } catch (error) {
          console.error("Error processing matches snapshot:", error);
          cb(null);
        }
      },
      (error) => {
        console.error("Firebase matches subscription error:", error);
        cb(null);
      }
    );
  } catch (error) {
    console.error("Error setting up matches subscription:", error);
    cb(null);
    return () => {};
  }
};

export const subscribeMessages = (conversationId: string, cb: (msgs: ChatMessage[]) => void) => {
  // Support both old "conversations" and new "threads" collections
  const messagesRef = collection(db, "threads", conversationId, "messages");
  const fallbackRef = collection(db, "conversations", conversationId, "messages");
  
  const q = query(messagesRef, orderBy("createdAt", "asc")); // ASC: oldest first, newest at bottom
  const fallbackQ = query(fallbackRef, orderBy("createdAt", "asc"));
  
  // Try threads first (new structure)
  return onSnapshot(q, (snap) => {
    const items: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, "id">),
    }));
    cb(items);
  }, (error) => {
    // Fallback to old conversations structure
    console.warn("Thread messages not found, trying conversations:", error);
    return onSnapshot(fallbackQ, (snap) => {
      const items: ChatMessage[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, "id">),
      }));
      cb(items);
    });
  });
};

export const sendMessage = async (conversationId: string, senderId: string, text: string) => {
  // Support both old "conversations" and new "threads" collections
  const threadRef = doc(db, "threads", conversationId);
  const conversationRef = doc(db, "conversations", conversationId);
  
  // Try threads first (new structure)
  try {
    const threadSnap = await getDoc(threadRef);
    if (threadSnap.exists()) {
      await addDoc(collection(db, "threads", conversationId, "messages"), {
        senderId,
        text,
        createdAt: serverTimestamp(),
      });
      await updateDoc(threadRef, {
        lastMessageAt: serverTimestamp(),
      });
      return;
    }
  } catch (e) {
    console.warn("Thread not found, using conversations:", e);
  }
  
  // Fallback to old structure
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(conversationRef, {
    lastMessageAt: serverTimestamp(),
  });
};
