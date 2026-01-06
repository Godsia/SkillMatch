import {View, Text, Pressable, ImageBackground} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {stylesRedirect} from "../../../../styles/register/style";

export default function RedirectionPage() {
    const navigation = useNavigation();

    const handlePressRegistr  = () => {
        navigation.navigate('Registration' as never);
    };
    const handlePressLogin  = () => {
        navigation.navigate('Authorization' as never);
    };


    return (
        <View style={stylesRedirect.container}>
            <ImageBackground
                source={require('../../../../images/backgroundauth.jpg')}
                style={stylesRedirect.background}
                resizeMode="cover"
            >
                <View style={stylesRedirect.content}>
                    {/* Заголовок */}
                    <Text style={stylesRedirect.title}>
                        Выбери Свой Путь{'\n'}Мечты В Дизайне
                    </Text>

                    {/* Подзаголовок */}
                    <Text style={stylesRedirect.subtitle}>
                        Начните с регистрации с помощью:
                    </Text>

                    {/* Контейнер для кнопок */}
                    <View style={stylesRedirect.buttonsContainer}>
                        {/* Кнопка HeadHunter */}
                        <Pressable style={stylesRedirect.button}>
                            <View style={stylesRedirect.iconPlaceholder} />
                            <Text style={stylesRedirect.buttonText}>HeadHunter</Text>
                        </Pressable>

                        {/* Кнопка Google */}
                        <Pressable style={stylesRedirect.button}>
                            <View style={stylesRedirect.iconPlaceholder} />
                            <Text style={stylesRedirect.buttonText}>Google</Text>
                        </Pressable>

                        {/* Кнопка Yandex */}
                        <Pressable style={stylesRedirect.button}>
                            <View style={stylesRedirect.iconPlaceholder} />
                            <Text style={stylesRedirect.buttonText}>Yandex</Text>
                        </Pressable>

                        {/* Кнопка Ручной регистрации */}
                        <Pressable style={stylesRedirect.manualButton} onPress={handlePressRegistr}>
                            <View style={stylesRedirect.iconPlaceholder} />
                            <Text style={stylesRedirect.manualButtonText}>
                                Зарегистрироваться Вручную
                            </Text>
                        </Pressable>
                        <Pressable style={stylesRedirect.manualButton} onPress={handlePressLogin}>
                            <View style={stylesRedirect.iconPlaceholder} />
                            <Text style={stylesRedirect.manualButtonText}>
                                Авторизация
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}
