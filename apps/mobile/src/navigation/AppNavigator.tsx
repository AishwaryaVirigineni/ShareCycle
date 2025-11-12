// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RequestPadScreen from "../screens/RequestPadScreen";
import ConfirmRequestScreen from "../screens/ConfirmRequestScreen";
import RequestSubmittedScreen from "../screens/RequestSubmittedScreen";
import ChatScreen from "../screens/ChatScreen";
import BotChatScreen from "../screens/BotChatScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RequestPad: undefined;
  ConfirmRequest: {
    latitude: number;
    longitude: number;
    address?: string;
    ownerId: string;
  };
  RequestSent: {
    requestId: string;
    ownerId: string;
    urgency?: "urgent" | "normal" | "low";
    empathy?: string;
  };
  RequestSubmitted: {
    requestId: string;
    ownerId: string;
  };
  Chat: {
    conversationId: string;
    meId: string;
    otherId: string;
    isConnected?: boolean;
  };
  BotChat: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [initialRoute, setInitialRoute] = useState<{ name: string; params?: any } | null>(null);
  const [routeCheckComplete, setRouteCheckComplete] = useState(false);

  useEffect(() => {
    checkLoginStatus().then((route) => {
      if (route) {
        setInitialRoute(route);
      }
      setRouteCheckComplete(true);
    });
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userName = await AsyncStorage.getItem("userName");
      const loggedIn = !!userName;
      setIsLoggedIn(loggedIn);
      
      // If logged in, check for active thread
      if (loggedIn) {
        const { getOwnerId } = await import("../ownerId");
        const ownerId = await getOwnerId();
        if (ownerId) {
          const { getActiveThread } = await import("../services/storageService");
          const activeThread = await getActiveThread(ownerId);
          
          // If active thread exists, verify it's still active in Firestore
          if (activeThread) {
            const { db } = await import("../firebaseConfig");
            const { doc, getDoc } = await import("firebase/firestore");
            const matchRef = doc(db, "matches", `${activeThread.requestId}_${activeThread.role === 'requester' ? activeThread.otherId : ownerId}`);
            const matchSnap = await getDoc(matchRef);
            
            if (matchSnap.exists() && matchSnap.data()?.status === "active") {
              // Route to active chat immediately
              return {
                name: "Chat",
                params: {
                  conversationId: activeThread.threadId,
                  meId: ownerId,
                  otherId: activeThread.otherId,
                  isConnected: true,
                  role: activeThread.role,
                  urgency: activeThread.urgency,
                  isTopK: activeThread.isTopK,
                  requestId: activeThread.requestId,
                },
              };
            } else {
              // Clear stale active thread
              const { clearActiveThread } = await import("../services/storageService");
              await clearActiveThread(ownerId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking login/active thread:", error);
      setIsLoggedIn(false);
    }
    return null;
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    // Clear login state
    setIsLoggedIn(false);
    // Re-check login status to ensure consistency
    await checkLoginStatus();
  };

  if (isLoggedIn === null || (isLoggedIn && !routeCheckComplete)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute?.name || (isLoggedIn ? "Home" : "Login")}
      >
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "ShareCycle" }}
            />
            <Stack.Screen
              name="RequestPad"
              component={RequestPadScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ConfirmRequest"
              component={ConfirmRequestScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RequestSent"
              component={RequestSubmittedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RequestSubmitted"
              component={RequestSubmittedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: "Chat" }}
              initialParams={initialRoute?.params}
            />
            <Stack.Screen
              name="BotChat"
              component={BotChatScreen}
              options={{ title: "Blossom Bot" }}
            />
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
