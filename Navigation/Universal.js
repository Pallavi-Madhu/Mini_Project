import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import RootNavigator from "./RootNavigator.js";
import AuthStack from "./AuthStack.js";
import { supabase } from "../src/lib/supabaseClient";

const Stack = createStackNavigator();

const Universal = () => {
  const [session, setSession] = useState(undefined); // undefined = still loading

  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show a spinner while we check the session
  if (session === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {session ? (
        <Stack.Screen
          name="RootNavigator"
          component={RootNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="AuthStack"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default Universal;