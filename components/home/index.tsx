import {View, Text, Pressable, SafeAreaView, StyleSheet, Image, Linking, ActivityIndicator, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useState, useEffect} from 'react';
import {vacanciesApi, Vacancy, getAccessToken, setAccessToken} from '../../services/api';
import {styles} from "../../styles/home";
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function HomePage() {
    const navigation = useNavigation();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        // Восстанавливаем токен при загрузке страницы
        const token = getAccessToken();
        if (token) {
            setAccessToken(token);
            console.log('Токен восстановлен при загрузке Home страницы');
        }
        loadVacancies();
    }, []);

    const loadVacancies = async () => {
        setIsLoading(true);
        try {
            const data = await vacanciesApi.getMatches();
            setVacancies(data);
            setCurrentIndex(0);
        } catch (error: any) {
            console.error('Ошибка загрузки вакансий:', error);
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось загрузить вакансии. Попробуйте позже."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async () => {
        if (isProcessing || !currentVacancy) return;
        
        setIsProcessing(true);
        try {
            // Восстанавливаем токен перед запросом
            const token = getAccessToken();
            if (token) {
                setAccessToken(token);
            }
            
            await vacanciesApi.likeVacancy(currentVacancy.id);
            // Переходим к следующей вакансии
            moveToNext();
        } catch (error: any) {
            console.error('Ошибка лайка вакансии:', error);
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message || "Не удалось добавить вакансию в избранное.";
            
            if (status === 403) {
                Alert.alert(
                    "Ошибка доступа",
                    "У вас нет прав для выполнения этого действия. Возможно, требуется повторная авторизация.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Можно перенаправить на страницу логина
                                // navigation.navigate('Authorization' as never);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Ошибка", message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = () => {
        if (isProcessing) return;
        moveToNext();
    };

    const handleHH = async () => {
        if (!currentVacancy?.url) return;
        try {
            const supported = await Linking.canOpenURL(currentVacancy.url);
            if (supported) {
                await Linking.openURL(currentVacancy.url);
            } else {
                Alert.alert("Ошибка", "Не удалось открыть ссылку на вакансию.");
            }
        } catch (error) {
            console.error('Ошибка открытия ссылки:', error);
            Alert.alert("Ошибка", "Не удалось открыть ссылку на вакансию.");
        }
    };

    const moveToNext = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex < vacancies.length - 1) {
                return prevIndex + 1;
            } else {
                // Все вакансии просмотрены
                return vacancies.length;
            }
        });
    };

    const currentVacancy = vacancies[currentIndex];
    const hasMoreVacancies = currentIndex < vacancies.length;

    const formatSalary = (vacancy: Vacancy): string => {
        if (!vacancy.salaryFrom && !vacancy.salaryTo) {
            return 'Зарплата не указана';
        }
        const from = vacancy.salaryFrom ? vacancy.salaryFrom.toLocaleString('ru-RU') : '';
        const to = vacancy.salaryTo ? vacancy.salaryTo.toLocaleString('ru-RU') : '';
        const currency = vacancy.salaryCurrency || '₽';
        const gross = vacancy.salaryGross ? ' до вычета налогов' : ' на руки';
        
        if (from && to) {
            return `${from} - ${to} ${currency}${gross}`;
        } else if (from) {
            return `от ${from} ${currency}${gross}`;
        } else if (to) {
            return `до ${to} ${currency}${gross}`;
        }
        return '';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Section */}
            <View style={styles.topSection}>
                <Pressable style={styles.filterButton}>
                    <View style={styles.filterIcon}>
                        <View style={styles.filterLine} />
                        <View style={styles.filterLine} />
                        <View style={styles.filterLine} />
                    </View>
                </Pressable>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#4131B6" />
                ) : !hasMoreVacancies ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Список вакансий пуст</Text>
                        <Text style={styles.emptySubtext}>Новых подходящих вакансий пока нет</Text>
                    </View>
                ) : currentVacancy ? (
                    <>
                        {/* Job Card */}
                        <View style={styles.jobCard}>
                            {/* Match Badge */}
                            <View style={styles.matchBadge}>
                                <AnimatedCircularProgress
                                    size={40}              // диаметр круга
                                    width={4}              // толщина линии
                                    fill={currentVacancy.matchPercent * 10} // процент заполнения
                                    tintColor="#FFFFFF"    // цвет прогресса
                                    backgroundColor="#7B7BFF" // фон круга
                                    rotation={0}
                                >
                                    {(fill:number) => (
                                        <Text style={styles.matchPercentText}>
                                            {Math.round(currentVacancy.matchPercent * 100)}%
                                        </Text>
                                    )}
                                </AnimatedCircularProgress>

                                <Text style={styles.matchText}>Мэтч</Text>
                            </View>

                            {/* Logo */}
                            {currentVacancy.employerLogoUrl ? (
                                <Image
                                    source={{uri: currentVacancy.employerLogoUrl}}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Text style={styles.logoPlaceholderText}>
                                        {currentVacancy.employerName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}

                            {/* Company Name */}
                            <Text style={styles.companyName}>{currentVacancy.employerName}</Text>

                            {/* Job Title */}
                            <Text style={styles.jobTitle}>{currentVacancy.title}</Text>

                            {/* Additional Info */}
                            <View style={styles.jobInfo}>
                                {currentVacancy.areaName && (
                                    <Text style={styles.jobInfoText}>{currentVacancy.areaName}</Text>
                                )}
                                {formatSalary(currentVacancy) !== 'Зарплата не указана' && (
                                    <Text style={styles.jobInfoText}> • {formatSalary(currentVacancy)}</Text>
                                )}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            {/* Reject */}
                            <Pressable
                                style={[styles.actionButtonSmall, styles.rejectButton]}
                                onPress={handleReject}
                                disabled={isProcessing}
                            >
                                <Text style={styles.rejectIcon}>✕</Text>
                            </Pressable>

                            {/* Like */}
                            <Pressable
                                style={[styles.actionButtonLarge, styles.likeButton]}
                                onPress={handleLike}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.likeIcon}>♡</Text>
                                )}
                            </Pressable>

                            {/* HH */}
                            <Pressable
                                style={[styles.actionButtonSmall, styles.chatButton]}
                                onPress={() => console.log('Открыть чат')}
                            >
                                <Text style={styles.chatIcon}>💬</Text>
                            </Pressable>
                        </View>
                    </>
                ) : null}
            </View>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                {/* Карточки (активная) */}
                <Pressable style={styles.navItem}>
                    <View style={[styles.navIcon, styles.navIconActive]} />
                    <View style={styles.navIndicator} />
                </Pressable>

                {/* Сердце (неактивная, с точкой) */}
                <Pressable style={styles.navItem}>
                    <View style={styles.navIcon}>
                        <Text style={styles.heartIcon}>♡</Text>
                        <View style={styles.navDot} />
                    </View>
                </Pressable>

                {/* Профиль */}
                <Pressable style={styles.navItem}>
                    <View style={styles.navIcon}>
                        <Text style={styles.profileIcon}>👤</Text>
                    </View>
                </Pressable>

{/*                <Pressable style={styles.navItem}>
                    <View style={styles.navIcon}>
                        <Text style={styles.moreIcon}>⋯</Text>
                    </View>
                </Pressable>**/}
            </View>
        </SafeAreaView>
    );
}
