import {View, Text, Pressable, SafeAreaView, StyleSheet, Image, Linking, ActivityIndicator, Alert, Modal, ScrollView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useState, useEffect} from 'react';
import {vacanciesApi, Vacancy, getAccessToken, setAccessToken, isAuthFailureError} from '../../../services/api';
import {styles} from "../../../styles/home";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import {BlurView} from "expo-blur";

export default function HomePage() {
    const navigation = useNavigation();
    const route = useRoute();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState<boolean>(false);
    const [feedbackVacancy, setFeedbackVacancy] = useState<Vacancy | null>(null);
    const [likedMatching, setLikedMatching] = useState<boolean | null>(null);
    const [feedbackRating, setFeedbackRating] = useState<number>(0);
    const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);

    const currentRouteName = route.name;
    const FEEDBACK_EVERY_N_CARDS = 15;

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
            // Сессия недействительна — глобальный обработчик в services/api.ts
            // сбросит токен и отправит пользователя на экран логина.
            if (isAuthFailureError(error)) {
                return;
            }
            console.error(
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
            const isFifteenthCard = (currentIndex + 1) % FEEDBACK_EVERY_N_CARDS === 0;
            if (isFifteenthCard) {
                setFeedbackVacancy(currentVacancy);
                setLikedMatching(null);
                setFeedbackRating(0);
                setIsFeedbackModalVisible(true);
            } else {
                moveToNext();
            }
        } catch (error: any) {
            console.error('Ошибка лайка вакансии:', error);
            if (isAuthFailureError(error)) {
                return;
            }
            const message = error.response?.data?.message || error.message || "Не удалось добавить вакансию в избранное.";
            console.error("Ошибка:", message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (isProcessing || !currentVacancy) return;
        
        setIsProcessing(true);
        try {
            // Восстанавливаем токен перед запросом
            const token = getAccessToken();
            if (token) {
                setAccessToken(token);
            }
            
            await vacanciesApi.likeVacancy(currentVacancy.id, false);
            const isFifteenthCard = (currentIndex + 1) % FEEDBACK_EVERY_N_CARDS === 0;
            if (isFifteenthCard) {
                setFeedbackVacancy(currentVacancy);
                setLikedMatching(null);
                setFeedbackRating(0);
                setIsFeedbackModalVisible(true);
            } else {
                moveToNext();
            }
        } catch (error: any) {
            console.error('Ошибка отказа от вакансии:', error);
            if (isAuthFailureError(error)) {
                return;
            }
            const message = error.response?.data?.message || error.message || "Не удалось добавить вакансию в архив.";
            console.error("Ошибка:", message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleHH = async (vacancy?: Vacancy) => {
        const vacancyToUse = vacancy || currentVacancy;
        if (!vacancyToUse?.url) return;
        const url = vacancyToUse.url;
        try {
            await Linking.openURL(url);
        } catch (error: any) {
            // На Android/iOS openURL часто отклоняет промис, даже когда браузер уже открыл ссылку — не показываем алерт
            const msg = error?.message ?? String(error);
            if (msg.includes('Unable to open URL')) {
                console.warn('Linking.openURL отклонил промис (ссылка могла открыться):', url);
            } else {
                console.error('Ошибка открытия ссылки:', error);
            }
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

    const closeFeedbackModal = () => {
        setIsFeedbackModalVisible(false);
        setFeedbackVacancy(null);
        setLikedMatching(null);
        setFeedbackRating(0);
        moveToNext();
    };

    const submitFeedback = async () => {
        if (!feedbackVacancy || likedMatching === null || feedbackRating < 1) return;
        setIsSendingFeedback(true);
        try {
            const token = getAccessToken();
            if (token) setAccessToken(token);
            await vacanciesApi.sendFeedback(feedbackVacancy.id, {
                likedMatching: likedMatching,
                rating: feedbackRating,
            });
            closeFeedbackModal();
        } catch (error: any) {
            const status = error.response?.status;
            const data = error.response?.data;
            const serverMessage =
                typeof data?.message === 'string'
                    ? data.message
                    : data?.error || (typeof data === 'string' ? data : null);
            console.error('Ошибка отправки отзыва:', status, data);

            if (isAuthFailureError(error)) {
                return;
            }

            console.error('Ошибка:', serverMessage || 'Не удалось отправить отзыв. Попробуйте позже.');
        } finally {
            setIsSendingFeedback(false);
        }
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

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.toLocaleString('ru-RU', { month: 'long' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateString;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Section — отступ сохранён для дизайна */}
            <View style={styles.topSection} />

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
                        {/* Job Card with Blurred Logo Background */}
                        <Pressable 
                            style={[styles.jobCard, cardStyles.jobCardOverride]}
                            onPress={() => {
                                console.log('Opening modal with vacancy:', currentVacancy);
                                setSelectedVacancy(currentVacancy);
                                setIsModalVisible(true);
                            }}
                        >
                            {currentVacancy.employerLogoUrl ? (
                                <>
                                    {/* Фоновый слой с размытым логотипом */}
                                    <View style={cardStyles.backgroundContainer}>
                                        <Image
                                            source={{ uri: currentVacancy.employerLogoUrl }}
                                            style={cardStyles.backgroundImage}
                                            resizeMode="cover"
                                        />
                                        <BlurView
                                            style={cardStyles.backgroundBlur}
                                            intensity={90}
                                            tint="dark"
                                        />
                                        <View style={cardStyles.backgroundOverlay} />
                                    </View>

                                    {/* Контент поверх фона */}
                                    <View style={cardStyles.cardContent}>
                                        <View style={[styles.matchBadge, cardStyles.matchBadgePosition]}>
                                            <AnimatedCircularProgress
                                                size={36}
                                                width={3}
                                                fill={currentVacancy.matchPercent}
                                                tintColor="#FFFFFF"
                                                backgroundColor="rgba(255,255,255,0.3)"
                                                rotation={0}
                                            >
                                                {(fill: number) => (
                                                    <Text style={styles.matchPercentText}>
                                                        {Math.round(currentVacancy.matchPercent)}%
                                                    </Text>
                                                )}
                                            </AnimatedCircularProgress>
                                            <Text style={styles.matchText}>Мэтч</Text>
                                        </View>

                                        <Image
                                            source={{ uri: currentVacancy.employerLogoUrl }}
                                            style={cardStyles.logo}
                                            resizeMode="contain"
                                        />

                                        <Text style={cardStyles.companyName} numberOfLines={1}>
                                            {currentVacancy.employerName}
                                        </Text>

                                        <Text style={cardStyles.jobTitle} numberOfLines={2}>
                                            {currentVacancy.title}
                                        </Text>

                                        <View style={cardStyles.jobInfoContainer}>
                                            {currentVacancy.areaName && (
                                                <Text style={cardStyles.jobInfoText} numberOfLines={1}>
                                                    {currentVacancy.areaName}
                                                </Text>
                                            )}
                                            {formatSalary(currentVacancy) !== 'Зарплата не указана' && (
                                                <Text style={cardStyles.jobInfoText} numberOfLines={1}>
                                                    {currentVacancy.areaName ? ' • ' : ''}{formatSalary(currentVacancy)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={[cardStyles.backgroundContainer, cardStyles.cardBackgroundFallback]} />
                                    <View style={cardStyles.cardContent}>
                                        <View style={[styles.matchBadge, cardStyles.matchBadgePosition]}>
                                            <AnimatedCircularProgress
                                                size={36}
                                                width={3}
                                                fill={currentVacancy.matchPercent}
                                                tintColor="#FFFFFF"
                                                backgroundColor="rgba(255,255,255,0.3)"
                                                rotation={0}
                                            >
                                                {(fill: number) => (
                                                    <Text style={styles.matchPercentText}>
                                                        {Math.round(currentVacancy.matchPercent)}%
                                                    </Text>
                                                )}
                                            </AnimatedCircularProgress>
                                            <Text style={styles.matchText}>Мэтч</Text>
                                        </View>

                                        <View style={cardStyles.logoPlaceholder}>
                                            <Text style={cardStyles.logoPlaceholderText}>
                                                {currentVacancy.employerName.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>

                                        <Text style={cardStyles.companyName} numberOfLines={1}>
                                            {currentVacancy.employerName}
                                        </Text>

                                        <Text style={cardStyles.jobTitle} numberOfLines={2}>
                                            {currentVacancy.title}
                                        </Text>

                                        <View style={cardStyles.jobInfoContainer}>
                                            {currentVacancy.areaName && (
                                                <Text style={cardStyles.jobInfoText} numberOfLines={1}>
                                                    {currentVacancy.areaName}
                                                </Text>
                                            )}
                                            {formatSalary(currentVacancy) !== 'Зарплата не указана' && (
                                                <Text style={cardStyles.jobInfoText} numberOfLines={1}>
                                                    {currentVacancy.areaName ? ' • ' : ''}{formatSalary(currentVacancy)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </>
                            )}
                        </Pressable>

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

                            {/* HH — открыть ссылку на вакансию с бэкенда */}
                            <Pressable
                                style={[styles.actionButtonSmall, styles.chatButton]}
                                onPress={() => handleHH()}
                                disabled={!currentVacancy?.url}
                            >
                                <Text style={styles.chatIcon}>💬</Text>
                            </Pressable>
                        </View>
                    </>
                ) : null}
            </View>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                {/* Карточки (мэтчинг) */}
                {/* Карточки (мэтчинг) */}
                <Pressable
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Home' as never)}
                >
                    <View style={[styles.navIcon, currentRouteName === 'Home' && styles.navIconActive]}>
                        <Text style={[
                            styles.heartIcon,
                            currentRouteName === 'Home' ? { color: '#FFFFFF' } : { color: '#999999' }
                        ]}>
                            🀆
                        </Text>
                    </View>
                    {currentRouteName === 'Home' && <View style={styles.navIndicator} />}
                </Pressable>

                {/* Сердце (избранные вакансии) */}
                <Pressable 
                    style={styles.navItem}
                    onPress={() => navigation.navigate('SelectedVacancies' as never)}
                >
                    <View style={styles.navIcon}>
                        <Text style={styles.heartIcon}>♡</Text>
                        <View style={styles.navDot} />
                    </View>
                </Pressable>

                {/* Профиль */}
                <Pressable 
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Profile' as never)}
                >
                    <View style={styles.navIcon}>
                        <Text style={styles.profileIcon}>👤</Text>
                    </View>
                </Pressable>

                {/* Ещё */}
{/*                <Pressable style={styles.navItem}>
                    <View style={styles.navIcon}>
                        <Text style={styles.moreIcon}>⋯</Text>
                    </View>
                </Pressable>*/}
            </View>

            {/* Feedback Modal (every 15 cards) */}
            <Modal
                visible={isFeedbackModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={closeFeedbackModal}
            >
                <View style={feedbackModalStyles.overlay}>
                    <View style={feedbackModalStyles.modal}>
                        <Pressable
                            style={feedbackModalStyles.closeButton}
                            onPress={closeFeedbackModal}
                        >
                            <Text style={feedbackModalStyles.closeButtonText}>✕</Text>
                        </Pressable>

                        <Text style={feedbackModalStyles.question}>
                            Тебе понравился процесс мэтчинга?
                        </Text>
                        <View style={feedbackModalStyles.thumbsRow}>
                            <Pressable
                                style={[
                                    feedbackModalStyles.thumbButton,
                                    likedMatching === false && feedbackModalStyles.thumbSelected,
                                ]}
                                onPress={() => setLikedMatching(false)}
                            >
                                <Text style={feedbackModalStyles.thumbIcon}>👎</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    feedbackModalStyles.thumbButton,
                                    likedMatching === true && feedbackModalStyles.thumbSelected,
                                ]}
                                onPress={() => setLikedMatching(true)}
                            >
                                <Text style={feedbackModalStyles.thumbIcon}>👍</Text>
                            </Pressable>
                        </View>

                        <Text style={feedbackModalStyles.question}>
                            Насколько эта вакансия соответствует твоим запросам?
                        </Text>
                        <View style={feedbackModalStyles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Pressable
                                    key={star}
                                    style={feedbackModalStyles.starButton}
                                    onPress={() => setFeedbackRating(star)}
                                >
                                    <Text
                                        style={[
                                            feedbackModalStyles.starIcon,
                                            feedbackRating >= star && feedbackModalStyles.starFilled,
                                        ]}
                                    >
                                        ★
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable
                            style={[
                                feedbackModalStyles.submitButton,
                                (likedMatching === null || feedbackRating < 1 || isSendingFeedback) &&
                                    feedbackModalStyles.submitButtonDisabled,
                            ]}
                            onPress={submitFeedback}
                            disabled={likedMatching === null || feedbackRating < 1 || isSendingFeedback}
                        >
                            {isSendingFeedback ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={feedbackModalStyles.submitButtonText}>Отправить</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Vacancy Details Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContent}>
                        {/* Close Button */}
                        <Pressable 
                            style={modalStyles.closeButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={modalStyles.closeButtonText}>✕</Text>
                        </Pressable>

                        {selectedVacancy ? (
                            <ScrollView 
                                style={modalStyles.scrollView}
                                contentContainerStyle={modalStyles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Vacancy Info Section */}
                                <View style={modalStyles.section}>
                                    <Text style={modalStyles.vacancyTitle}>
                                        {selectedVacancy.title || 'Название не указано'}
                                    </Text>
                                    <Text style={modalStyles.companyName}>
                                        {selectedVacancy.employerName || 'Компания не указана'}
                                    </Text>
                                    
                                    {/* Location and Salary */}
                                    <View style={modalStyles.infoRow}>
                                        {selectedVacancy.areaName && (
                                            <Text style={modalStyles.infoText}>{selectedVacancy.areaName}</Text>
                                        )}
                                        {formatSalary(selectedVacancy) !== 'Зарплата не указана' && (
                                            <Text style={modalStyles.infoText}> • {formatSalary(selectedVacancy)}</Text>
                                        )}
                                    </View>
                                    
                                    {/* Published Date */}
                                    {selectedVacancy.publishedAt && (
                                        <Text style={modalStyles.publishedDate}>
                                            Опубликовано: {formatDate(selectedVacancy.publishedAt)}
                                        </Text>
                                    )}
                                </View>

                                {/* Divider */}
                                <View style={modalStyles.divider} />

                                {/* About Vacancy Section */}
                                <View style={modalStyles.section}>
                                    <Text style={modalStyles.sectionTitle}>О вакансии</Text>
                                    <Text style={modalStyles.descriptionText}>
                                        {selectedVacancy.descriptionPlain || 'Описание вакансии отсутствует'}
                                    </Text>
                                    {selectedVacancy.url && (
                                        <Pressable onPress={() => {
                                            setIsModalVisible(false);
                                            handleHH(selectedVacancy);
                                        }}>
                                            <Text style={modalStyles.moreLink}>...подробнее</Text>
                                        </Pressable>
                                    )}
                                </View>

                                {/* Divider */}
                                <View style={modalStyles.divider} />

                                {/* Skills Section */}
                                <View style={modalStyles.section}>
                                    <Text style={modalStyles.sectionTitle}>Ключевые навыки</Text>
                                    <View style={modalStyles.skillsContainer}>
                                        {selectedVacancy.skills && selectedVacancy.skills.length > 0 ? (
                                            selectedVacancy.skills.map((skill, index) => (
                                                <View key={index} style={modalStyles.skillTag}>
                                                    <Text style={modalStyles.skillText}>{skill}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={modalStyles.noSkillsText}>Навыки не указаны</Text>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        ) : (
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.descriptionText}>Данные вакансии не загружены</Text>
                            </View>
                        )}

                        {/* Action Buttons in Modal */}
                        <View style={modalStyles.modalActionButtons}>
                            {/* Reject */}
                            <Pressable
                                style={[modalStyles.modalActionButtonSmall, modalStyles.modalRejectButton]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    if (selectedVacancy) {
                                        handleReject();
                                    }
                                }}
                                disabled={isProcessing || !selectedVacancy}
                            >
                                <Text style={modalStyles.rejectIcon}>✕</Text>
                            </Pressable>

                            {/* Like */}
                            <Pressable
                                style={[modalStyles.modalActionButtonLarge, modalStyles.modalLikeButton]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    if (selectedVacancy) {
                                        handleLike();
                                    }
                                }}
                                disabled={isProcessing || !selectedVacancy}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={modalStyles.likeIcon}>♡</Text>
                                )}
                            </Pressable>

                            {/* HH */}
                            <Pressable
                                style={[modalStyles.modalActionButtonSmall, modalStyles.modalChatButton]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    if (selectedVacancy) {
                                        handleHH(selectedVacancy);
                                    }
                                }}
                                disabled={!selectedVacancy?.url}
                            >
                                <Text style={modalStyles.chatIcon}>hh</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const cardStyles = StyleSheet.create({
    jobCardOverride: {
        overflow: 'hidden',
        width: '90%',
        alignSelf: 'center',
        height: 520,
        minHeight: 520,
        backgroundColor: 'transparent',
        borderRadius: 40,
        elevation: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 40,
        overflow: 'hidden',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    backgroundBlur: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 40,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        borderRadius: 40,
    },
    cardBackgroundFallback: {
        backgroundColor: '#4131B6',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 30,
        zIndex: 2,
    },
    matchBadgePosition: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        zIndex: 10,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 25,
        marginBottom: 16,
        marginTop: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 40,
    },
    logoPlaceholderText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4131B6',
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 20,
        opacity: 0.95,
    },
    jobInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
    },
    jobInfoText: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
});

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '85%',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#000000',
        fontWeight: 'bold',
    },
    scrollView: {
        flexGrow: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    debugText: {
        fontSize: 12,
        color: '#FF0000',
        marginBottom: 10,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    moreLink: {
        fontSize: 14,
        color: '#4131B6',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 8,
    },
    skillText: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    noSkillsText: {
        fontSize: 14,
        color: '#999999',
        fontStyle: 'italic',
    },
    vacancyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
    },
    companyName: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    infoText: {
        fontSize: 14,
        color: '#666666',
    },
    publishedDate: {
        fontSize: 12,
        color: '#999999',
        marginTop: 4,
    },
    modalActionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    modalActionButtonSmall: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalActionButtonLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4131B6',
        shadowColor: '#4131B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    modalRejectButton: {
        borderWidth: 0,
    },
    modalLikeButton: {
        borderWidth: 0,
    },
    modalChatButton: {
        borderWidth: 0,
    },
    rejectIcon: {
        fontSize: 24,
        color: '#FF3B30',
        fontWeight: 'bold',
    },
    likeIcon: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    chatIcon: {
        fontSize: 16,
        color: '#4131B6',
        fontWeight: 'bold',
    },
});

const feedbackModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 28,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#4131B6',
        fontWeight: 'bold',
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4131B6',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    thumbsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
        marginBottom: 28,
    },
    thumbButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    thumbSelected: {
        backgroundColor: '#4131B6',
    },
    thumbIcon: {
        fontSize: 28,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    starButton: {
        padding: 4,
    },
    starIcon: {
        fontSize: 32,
        color: '#DDD',
    },
    starFilled: {
        color: '#4131B6',
    },
    submitButton: {
        backgroundColor: '#4131B6',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
