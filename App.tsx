import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import HeadPage from "./components/head";
import {NavigationContainer, createNavigationContainerRef} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import RedirectionPage from "./components/auth/register/redirection";
import RegisterRootComponent from "./components/auth/register";
import LoginPage from "./components/auth/login";
import PasswordResetPage from "./components/auth/passwordReset";
import HomePage from "./components/home/main";
import SelectedVacanciesPage from "./components/home/selectedVacancies";
import ProfilePage from "./components/home/profile";
import { loadTokenFromStorage, setAccessToken, setOnAuthFailure } from "./services/api";

const navigationRef = createNavigationContainerRef();

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

        // Глобальный обработчик ошибок авторизации:
        // если бэкенд вернул 401/403 или 400 "User not found" — токен уже сброшен
        // в перехватчике, остаётся отправить пользователя на экран логина.
        setOnAuthFailure((reason) => {
            console.warn('Сессия недействительна, переходим на экран логина:', reason);
            if (navigationRef.isReady()) {
                navigationRef.reset({
                    index: 0,
                    routes: [{ name: 'Authorization' as never }],
                });
            }
        });

        return () => {
            setOnAuthFailure(null);
        };
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
        <NavigationContainer ref={navigationRef}>
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
                    name="PasswordReset"
                    component={PasswordResetPage}
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