import HeadPage from "./components/head";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import RedirectionPage from "./components/auth/register/redirection";
import RegisterRootComponent from "./components/auth/register";
import LoginPage from "./components/auth/login";

export default function App() {

    const Stack = createNativeStackNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName="Head"
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}