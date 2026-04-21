import { ImageBackground, View, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { headStyle } from "../../styles/register/style";

export default function HeadPage() {
    const navigation = useNavigation();

    const handleOnPress = () => {
        navigation.navigate('Redirection' as never);
    };

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/logo_main.jpg')}
            style={headStyle.background}
            resizeMode="cover"
        >
            <View style={headStyle.logo} />
            <View style={headStyle.buttonContainer}>
                <Pressable 
                    style={headStyle.button} 
                    onPress={handleOnPress}
                >
                    <Text style={headStyle.buttonText}>Присоединяйтесь!</Text>
                </Pressable>
            </View>
        </ImageBackground>
    );
}