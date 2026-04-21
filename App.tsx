import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import HeadPage from "./components/head";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import RedirectionPage from "./components/auth/register/redirection";
import RegisterRootComponent from "./components/auth/register";
import LoginPage from "./components/auth/login";
import HomePage from "./components/home/main";
import SelectedVacanciesPage from "./components/home/selectedVacancies";
import ProfilePage from "./components/home/profile";
import { loadTokenFromStorage, setAccessToken } from "./services/api";

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [hasStoredToken, setHasStoredToken] = useState(false);

    useEffect(() => {
        (async () => {
            const token = await loadTokenFromStorage();
            if (token) {
                setAccessToken(token);
                setHasStoredToken(true);
            }
            setIsReady(true);
        })();
    }, []);

    if (!isReady) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color="#4131B6" />
            </View>
        );
    }

    const Stack = createNativeStackNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={hasStoredToken ? 'Home' : 'Head'}
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen
                    name="Head"
                    component={HeadPage}
                    options={{ 
                        headerShown: false
                    }}
                />
                <Stack.Screen 
                    name="Redirection" 
                    component={RedirectionPage}
                    options={{ 
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="Registration"
                    component={RegisterRootComponent}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="Authorization"
                    component={LoginPage}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomePage}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="SelectedVacancies"
                    component={SelectedVacanciesPage}
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfilePage}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});