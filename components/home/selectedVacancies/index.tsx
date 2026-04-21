import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { vacanciesApi, Vacancy, getAccessToken, setAccessToken } from '../../../services/api';
import {styles as homeStyles, styles} from '../../../styles/home';
import VacancyCard from '../VacancyCard';

type TabType = 'favorites' | 'archive';

export default function SelectedVacanciesPage() {
    const navigation = useNavigation();
    const route = useRoute();
    const [activeTab, setActiveTab] = useState<TabType>('favorites');
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

    const currentRouteName = route.name;

    const loadVacancies = async (tab: TabType) => {
        setIsLoading(true);
        try {
            const data = tab === 'favorites' ? await vacanciesApi.getLiked() : await vacanciesApi.getDisliked();
            setVacancies(data);
        } catch (error: any) {
            console.error('Ошибка загрузки:', error);
            Alert.alert(
                'Ошибка',
                error.response?.data?.message || (tab === 'favorites' ? 'Не удалось загрузить избранные.' : 'Не удалось загрузить архив.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = getAccessToken();
        if (token) setAccessToken(token);
        loadVacancies(activeTab);
    }, [activeTab]);

    const formatSalary = (v: Vacancy): string => {
        if (!v.salaryFrom && !v.salaryTo) return 'Зарплата не указана';
        const from = v.salaryFrom ? v.salaryFrom.toLocaleString('ru-RU') : '';
        const to = v.salaryTo ? v.salaryTo.toLocaleString('ru-RU') : '';
        const currency = v.salaryCurrency || '₽';
        const gross = v.salaryGross ? ' до вычета налогов' : ' на руки';
        if (from && to) return `${from} - ${to} ${currency}${gross}`;
        if (from) return `от ${from} ${currency}${gross}`;
        if (to) return `до ${to} ${currency}${gross}`;
        return '';
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return `${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'long' })} ${date.getFullYear()}`;
        } catch {
            return dateString;
        }
    };

    const handleOpenUrl = async (v: Vacancy) => {
        if (!v?.url) return;
        try {
            const supported = await Linking.canOpenURL(v.url);
            if (supported) await Linking.openURL(v.url);
            else Alert.alert('Ошибка', 'Не удалось открыть ссылку.');
        } catch {
            Alert.alert('Ошибка', 'Не удалось открыть ссылку на вакансию.');
        }
    };

    const openModal = (vacancy: Vacancy) => {
        setSelectedVacancy(vacancy);
        setIsModalVisible(true);
    };

    const renderItem = ({ item }: { item: Vacancy }) => (
        <View style={listStyles.cardWrapper}>
            <VacancyCard vacancy={item} onPress={() => handleOpenUrl(item)} />
        </View>
    );

    const emptyMessages = {
        favorites: { title: 'Нет избранных вакансий', sub: 'Добавляйте вакансии лайком на главной' },
        archive: { title: 'Архив пуст', sub: 'Отклонённые вакансии появятся здесь' },
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={listStyles.header}>
                <View style={listStyles.tabsRow}>
                    <Pressable
                        style={[listStyles.tab, activeTab === 'favorites' && listStyles.tabActive]}
                        onPress={() => setActiveTab('favorites')}
                    >
                        <Text style={[listStyles.tabText, activeTab === 'favorites' && listStyles.tabTextActive]}>
                            Избранные
                        </Text>
                        {activeTab === 'favorites' && <View style={listStyles.tabIndicator} />}
                    </Pressable>
                    <Pressable
                        style={[listStyles.tab, activeTab === 'archive' && listStyles.tabActive]}
                        onPress={() => setActiveTab('archive')}
                    >
                        <Text style={[listStyles.tabText, activeTab === 'archive' && listStyles.tabTextActive]}>
                            Архив
                        </Text>
                        {activeTab === 'archive' && <View style={listStyles.tabIndicator} />}
                    </Pressable>
                </View>
            </View>
            {isLoading ? (
                <View style={listStyles.centered}>
                    <ActivityIndicator size="large" color="#4131B6" />
                </View>
            ) : vacancies.length === 0 ? (
                <View style={listStyles.centered}>
                    <Text style={listStyles.emptyText}>{emptyMessages[activeTab].title}</Text>
                    <Text style={listStyles.emptySubtext}>{emptyMessages[activeTab].sub}</Text>
                </View>
            ) : (
                <FlatList
                    data={vacancies}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={listStyles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <View style={styles.bottomNav}>
                <Pressable
                    style={homeStyles.navItem}
                    onPress={() => navigation.navigate('Home' as never)}
                >
                    <View style={[homeStyles.navIcon, currentRouteName === 'Home' && homeStyles.navIconActive]}>
                        <Text style={[
                            homeStyles.heartIcon,
                            currentRouteName === 'Home' ? { color: '#FFFFFF' } : { color: '#999999' }
                        ]}>
                            🀆
                        </Text>
                    </View>
                    {currentRouteName === 'Home' && <View style={homeStyles.navIndicator} />}
                </Pressable>
                <Pressable style={styles.navItem} onPress={() => {}}>
                    <View style={[styles.navIcon, currentRouteName === 'SelectedVacancies' && styles.navIconActive]}>
                        <Text style={styles.heartIcon}>♡</Text>
                        <View style={styles.navDot} />
                    </View>
                    {currentRouteName === 'SelectedVacancies' && <View style={styles.navIndicator} />}
                </Pressable>
                <Pressable style={styles.navItem} onPress={() => navigation.navigate('Profile' as never)}>
                    <View style={styles.navIcon}>
                        <Text style={styles.profileIcon}>👤</Text>
                    </View>
                </Pressable>
            </View>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContent}>
                        <Pressable style={modalStyles.closeButton} onPress={() => setIsModalVisible(false)}>
                            <Text style={modalStyles.closeButtonText}>✕</Text>
                        </Pressable>
                        {selectedVacancy ? (
                            <ScrollView
                                style={modalStyles.scrollView}
                                contentContainerStyle={modalStyles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={modalStyles.section}>
                                    <Text style={modalStyles.vacancyTitle}>
                                        {selectedVacancy.title || 'Название не указано'}
                                    </Text>
                                    <Text style={modalStyles.companyName}>
                                        {selectedVacancy.employerName || 'Компания не указана'}
                                    </Text>
                                    <View style={modalStyles.infoRow}>
                                        {selectedVacancy.areaName && (
                                            <Text style={modalStyles.infoText}>{selectedVacancy.areaName}</Text>
                                        )}
                                        {formatSalary(selectedVacancy) !== 'Зарплата не указана' && (
                                            <Text style={modalStyles.infoText}> • {formatSalary(selectedVacancy)}</Text>
                                        )}
                                    </View>
                                    {selectedVacancy.publishedAt && (
                                        <Text style={modalStyles.publishedDate}>
                                            Опубликовано: {formatDate(selectedVacancy.publishedAt)}
                                        </Text>
                                    )}
                                </View>
                                <View style={modalStyles.divider} />
                                <View style={modalStyles.section}>
                                    <Text style={modalStyles.sectionTitle}>О вакансии</Text>
                                    <Text style={modalStyles.descriptionText}>
                                        {selectedVacancy.descriptionPlain || 'Описание отсутствует'}
                                    </Text>
                                    {selectedVacancy.url && (
                                        <Pressable
                                            onPress={() => {
                                                setIsModalVisible(false);
                                                handleOpenUrl(selectedVacancy);
                                            }}
                                        >
                                            <Text style={modalStyles.moreLink}>...подробнее</Text>
                                        </Pressable>
                                    )}
                                </View>
                                <View style={modalStyles.divider} />
                                <View style={modalStyles.section}>
                                    <Text style={modalStyles.sectionTitle}>Ключевые навыки</Text>
                                    <View style={modalStyles.skillsContainer}>
                                        {selectedVacancy.skills?.length ? (
                                            selectedVacancy.skills.map((skill, i) => (
                                                <View key={i} style={modalStyles.skillTag}>
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
                            <Text style={modalStyles.descriptionText}>Данные не загружены</Text>
                        )}
                        {selectedVacancy?.url && (
                            <Pressable
                                style={[modalStyles.modalActionButtonLarge, modalStyles.modalChatButton]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    handleOpenUrl(selectedVacancy);
                                }}
                            >
                                <Text style={modalStyles.chatIcon}>Открыть на hh</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const listStyles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 8,
    },
    tabsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        position: 'relative',
    },
    tabActive: {},
    tabText: {
        fontSize: 16,
        color: '#999999',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#4131B6',
        fontWeight: 'bold',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#4131B6',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        paddingTop: 8,
    },
    cardWrapper: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 20,
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
    closeButtonText: { fontSize: 18, color: '#000', fontWeight: 'bold' },
    scrollView: { flexGrow: 1 },
    scrollContent: { paddingBottom: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 12 },
    vacancyTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 8 },
    companyName: { fontSize: 16, color: '#666', marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
    infoText: { fontSize: 14, color: '#666' },
    publishedDate: { fontSize: 12, color: '#999', marginTop: 4 },
    descriptionText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
    moreLink: { fontSize: 14, color: '#4131B6', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillTag: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 8,
    },
    skillText: { fontSize: 14, color: '#000', fontWeight: '500' },
    noSkillsText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
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
    modalActionButtonLarge: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4131B6',
        marginTop: 16,
    },
    modalChatButton: {},
    chatIcon: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
});
