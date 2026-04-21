import {View, Text, Pressable, SafeAreaView, ScrollView, ActivityIndicator, Alert, StyleSheet, Modal, TextInput} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useState, useEffect} from 'react';
import {authApi, UserProfile, getAccessToken, setAccessToken} from '../../../services/api';
import {allSkills} from '../../../data/skills';
import {allWorkFormation, allExperience} from '../../../data/expectations';
import {stylesSkillsChoose} from '../../../styles/register/style';
import {stylesExpectations} from '../../../styles/register/style';
import {styles as homeStyles} from '../../../styles/home';

export default function ProfilePage() {
    const navigation = useNavigation();
    const route = useRoute();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'skills' | 'conditions'>('skills');
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [customSkills, setCustomSkills] = useState<Array<{id: string, name: string}>>([]);
    const [customSkillInput, setCustomSkillInput] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    // Состояние для редактирования условий
    const [workFormation, setWorkFormation] = useState<string[]>([]);
    const [experience, setExperience] = useState<string>("");
    const [salary, setSalary] = useState<number[]>([0, 0]);
    const [salaryPeriod, setSalaryPeriod] = useState<string>("");
    const [showPeriodDropdown, setShowPeriodDropdown] = useState<boolean>(false);
    
    const currentRouteName = route.name;

    useEffect(() => {
        // Восстанавливаем токен при загрузке страницы
        const token = getAccessToken();
        if (token) {
            setAccessToken(token);
            console.log('Токен восстановлен при загрузке страницы профиля');
        }
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const data = await authApi.getProfile();
            setProfile(data);
        } catch (error: any) {
            console.error('Ошибка загрузки профиля:', error);
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось загрузить профиль. Попробуйте позже."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const getFullName = (): string => {
        if (!profile) return '';
        return `${profile.firstName} ${profile.lastName}`.trim();
    };

    const calculateProfileCompletion = (): number => {
        if (!profile) return 0;
        let completed = 0;
        let total = 6;
        
        if (profile.firstName) completed++;
        if (profile.lastName) completed++;
        if (profile.email) completed++;
        if (profile.skills && profile.skills.length > 0) completed++;
        if (profile.preferences) {
            if (profile.preferences.workFormats) completed++;
            if (profile.preferences.experienceLevel) completed++;
        }
        
        return Math.round((completed / total) * 100);
    };

    const handleLogout = () => {
        Alert.alert(
            "Выход",
            "Вы уверены, что хотите выйти из аккаунта?",
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Выйти",
                    style: "destructive",
                    onPress: () => {
                        setAccessToken(null);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Head' as never }],
                        } as never);
                    },
                },
            ]
        );
    };

    const openEditModal = () => {
        if (!profile) return;
        
        if (activeTab === 'skills') {
            // Преобразуем навыки из профиля в формат для редактирования
            const profileSkills = profile.skills || [];
            const skillIds: string[] = [];
            const custom: Array<{id: string, name: string}> = [];
            
            // Проверяем каждый навык из профиля
            profileSkills.forEach(skillName => {
                const foundSkill = allSkills.find(s => s.name === skillName);
                if (foundSkill) {
                    skillIds.push(foundSkill.id);
                } else {
                    // Это кастомный навык
                    custom.push({
                        id: `custom-${Date.now()}-${Math.random()}`,
                        name: skillName
                    });
                    skillIds.push(custom[custom.length - 1].id);
                }
            });
            
            setSelectedSkills(skillIds);
            setCustomSkills(custom);
        } else if (activeTab === 'conditions') {
            // Инициализируем данные условий из профиля
            const prefs = profile.preferences;
            if (prefs) {
                // Преобразуем workFormats из строки в массив
                const workFormatsArray = prefs.workFormats ? prefs.workFormats.split(',') : [];
                setWorkFormation(workFormatsArray);
                setExperience(prefs.experienceLevel || '');
                setSalary([prefs.salaryFrom || 0, prefs.salaryTo || 0]);
                setSalaryPeriod(prefs.salaryPeriod || '');
            } else {
                setWorkFormation([]);
                setExperience('');
                setSalary([0, 0]);
                setSalaryPeriod('');
            }
        }
        
        setIsEditModalVisible(true);
    };

    const toggleSkill = (skillId: string) => {
        if (selectedSkills.includes(skillId)) {
            setSelectedSkills(selectedSkills.filter(id => id !== skillId));
        } else {
            setSelectedSkills([...selectedSkills, skillId]);
        }
    };

    const handleAddCustomSkill = () => {
        if (customSkillInput.trim()) {
            const newSkillId = `custom-${Date.now()}`;
            const newSkill = {
                id: newSkillId,
                name: customSkillInput.trim()
            };
            setCustomSkills([...customSkills, newSkill]);
            setSelectedSkills([...selectedSkills, newSkillId]);
            setCustomSkillInput("");
        }
    };

    const handleSaveSkills = async () => {
        setIsSaving(true);
        try {
            const token = getAccessToken();
            if (token) {
                setAccessToken(token);
            }

            // Преобразуем выбранные навыки в формат API
            const skillsForAPI = selectedSkills.map(skillId => {
                const customSkill = customSkills.find(cs => cs.id === skillId);
                if (customSkill) {
                    return {
                        customSkill: customSkill.name
                    };
                }
                
                const skill = allSkills.find(s => s.id === skillId);
                return {
                    customSkill: skill?.name || skillId
                };
            });

            await authApi.setSkills({
                skills: skillsForAPI
            });

            await loadProfile();
            setIsEditModalVisible(false);
            Alert.alert("Успешно", "Навыки обновлены");
        } catch (error: any) {
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось сохранить навыки. Попробуйте еще раз."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            const token = getAccessToken();
            if (token) {
                setAccessToken(token);
            }

            const preferencesData = {
                workFormats: workFormation.join(','),
                experienceLevel: experience || '',
                salaryFrom: salary[0] || 0,
                salaryTo: salary[1] || 0,
                salaryPeriod: salaryPeriod || ''
            };

            await authApi.setPreferences(preferencesData);
            await loadProfile();
            setIsEditModalVisible(false);
            Alert.alert("Успешно", "Условия обновлены");
        } catch (error: any) {
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось сохранить условия. Попробуйте еще раз."
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Функции для работы с условиями
    const toggleWorkFormat = (formatId: string) => {
        if (workFormation.includes(formatId)) {
            setWorkFormation(workFormation.filter(id => id !== formatId));
        } else {
            setWorkFormation([...workFormation, formatId]);
        }
    };

    const handleExperienceChange = (experienceId: string) => {
        setExperience(experienceId);
    };

    const handleSalaryFromChange = (text: string) => {
        const value = text ? parseInt(text.replace(/\D/g, '')) : 0;
        setSalary([value, salary[1] || 0]);
    };

    const handleSalaryToChange = (text: string) => {
        const value = text ? parseInt(text.replace(/\D/g, '')) : 0;
        setSalary([salary[0] || 0, value]);
    };

    const handlePeriodSelect = (periodId: string) => {
        setSalaryPeriod(periodId);
        setShowPeriodDropdown(false);
    };

    const getPeriodName = () => {
        const salaryPeriods = [
            { id: 'month', name: 'В месяц' },
            { id: 'week', name: 'В неделю' },
            { id: 'project', name: 'За проект' },
            { id: 'hour', name: 'За час' },
            { id: 'piecework', name: 'Сдельная оплата' },
        ];
        const period = salaryPeriods.find(p => p.id === salaryPeriod);
        return period ? period.name : 'Период';
    };

    const allSkillsWithCustom = [...allSkills, ...customSkills];

    /** Преобразует id форматов работы с бэка в русские названия для отображения */
    const getWorkFormatDisplayNames = (workFormatsValue: string): string => {
        if (!workFormatsValue?.trim()) return '';
        const ids = workFormatsValue.split(',').map(s => s.trim()).filter(Boolean);
        const names = ids.map(id => {
            const item = allWorkFormation.find(f => f.id === id);
            return item ? item.name : id;
        });
        return names.join(', ');
    };

    /** Преобразует id уровня опыта с бэка в русское название для отображения */
    const getExperienceDisplayName = (experienceId: string): string => {
        if (!experienceId?.trim()) return '';
        const item = allExperience.find(e => e.id === experienceId);
        return item ? item.name : experienceId;
    };

    const formatSalary = (preferences: UserProfile['preferences']): string => {
        if (!preferences) return 'Не указана';
        
        const from = preferences.salaryFrom ? preferences.salaryFrom.toLocaleString('ru-RU') : '';
        const to = preferences.salaryTo ? preferences.salaryTo.toLocaleString('ru-RU') : '';
        const period = preferences.salaryPeriod || 'месяц';
        
        if (from && to) {
            return `${from} - ${to} ₽/${period}`;
        } else if (from) {
            return `от ${from} ₽/${period}`;
        } else if (to) {
            return `до ${to} ₽/${period}`;
        }
        return 'Не указана';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Профиль</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4131B6" />
                </View>
            ) : profile ? (
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Info Section */}
                    <View style={styles.profileSection}>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarIcon}>👤</Text>
                            </View>
                            <View style={styles.completionBadge}>
                                <Text style={styles.completionText}>{calculateProfileCompletion()}%</Text>
                            </View>
                        </View>

                        {/* Name */}
                        <Text style={styles.name}>{getFullName() || 'Имя не указано'}</Text>

                        {/* Actions */}
                        <View style={styles.actionsRow}>
                            {/* Edit Button - текст меняется в зависимости от активной вкладки */}
                            <Pressable style={styles.editButton} onPress={openEditModal}>
                                <Text style={styles.editButtonText}>
                                    {activeTab === 'skills' ? 'Редактировать навыки' : 'Редактировать условия'}
                                </Text>
                            </Pressable>
                            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutButtonText}>Выйти</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <Pressable 
                            style={styles.tab}
                            onPress={() => setActiveTab('skills')}
                        >
                            <Text style={[styles.tabText, activeTab === 'skills' && styles.tabTextActive]}>
                                Мои навыки
                            </Text>
                            {activeTab === 'skills' && <View style={styles.tabIndicator} />}
                        </Pressable>
                        <Pressable 
                            style={styles.tab}
                            onPress={() => setActiveTab('conditions')}
                        >
                            <Text style={[styles.tabText, activeTab === 'conditions' && styles.tabTextActive]}>
                                Условия
                            </Text>
                            {activeTab === 'conditions' && <View style={styles.tabIndicator} />}
                        </Pressable>
                    </View>

                    {/* Tab Content */}
                    {activeTab === 'skills' ? (
                        <View style={styles.tabContent}>
{/*                            <Pressable style={styles.editButtonInTab} onPress={openEditModal}>
                                <Text style={styles.editButtonInTabText}>Редактировать навыки</Text>
                            </Pressable>*/}
                            <View style={styles.skillsGrid}>
                                {profile.skills && profile.skills.length > 0 ? (
                                    profile.skills.map((skill, index) => (
                                        <View key={index} style={styles.skillTag}>
                                            <Text style={styles.skillText}>{skill}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Навыки не указаны</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.tabContent}>
{/*                            <Pressable style={styles.editButtonInTab} onPress={openEditModal}>
                                <Text style={styles.editButtonInTabText}>Редактировать условия</Text>
                            </Pressable>*/}
                            {/* Employment Type */}
                            {profile.preferences?.workFormats && (
                                <View style={styles.conditionSection}>
                                    <View style={styles.conditionHeader}>
                                        <Text style={styles.conditionTitle}>Тип занятости</Text>
                                    </View>
                                    <View style={styles.conditionButtons}>
                                        <View style={[styles.conditionButton, styles.conditionButtonActive]}>
                                            <Text style={[styles.conditionButtonText, styles.conditionButtonTextActive]}>
                                                {getWorkFormatDisplayNames(profile.preferences.workFormats)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Experience Level */}
                            {profile.preferences?.experienceLevel && (
                                <View style={styles.conditionSection}>
                                    <View style={styles.conditionHeader}>
                                        <Text style={styles.conditionTitle}>Уровень опыта</Text>
                                    </View>
                                    <View style={styles.conditionButtons}>
                                        <View style={[styles.conditionButton, styles.conditionButtonActive]}>
                                            <Text style={[styles.conditionButtonText, styles.conditionButtonTextActive]}>
                                                {getExperienceDisplayName(profile.preferences.experienceLevel)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Salary */}
                            {(profile.preferences?.salaryFrom || profile.preferences?.salaryTo) && (
                                <View style={styles.conditionSection}>
                                    <View style={styles.conditionHeader}>
                                        <Text style={styles.conditionTitle}>Зарплата</Text>
                                    </View>
                                    <View style={styles.conditionButtons}>
                                        <View style={[styles.conditionButton, styles.conditionButtonActive]}>
                                            <Text style={[styles.conditionButtonText, styles.conditionButtonTextActive]}>
                                                {formatSalary(profile.preferences)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Если нет данных */}
                            {!profile.preferences?.workFormats && !profile.preferences?.experienceLevel && 
                             !profile.preferences?.salaryFrom && !profile.preferences?.salaryTo && (
                                <View style={styles.conditionSection}>
                                    <Text style={styles.emptyText}>Условия не указаны</Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Не удалось загрузить профиль</Text>
                </View>
            )}

            {/* Edit Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                {activeTab === 'skills' ? (
                    <SafeAreaView style={stylesSkillsChoose.container}>
                        <View style={stylesSkillsChoose.header}>
                            <Pressable
                                style={stylesSkillsChoose.backButton}
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={stylesSkillsChoose.backButtonText}>←</Text>
                            </Pressable>
                            <Pressable 
                                style={[
                                    stylesSkillsChoose.skipButton,
                                    isSaving && { opacity: 0.6 }
                                ]}
                                onPress={handleSaveSkills}
                                disabled={isSaving}
                            >
                                <Text style={stylesSkillsChoose.skipButtonText}>
                                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                                </Text>
                            </Pressable>
                        </View>
                        <ScrollView
                            contentContainerStyle={stylesSkillsChoose.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={stylesSkillsChoose.title}>Ваши Скиллы</Text>
                            <Text style={stylesSkillsChoose.description}>
                                Отметьте свои навыки, и мы найдём для вас лучшее предложение!
                            </Text>
                            <View style={stylesSkillsChoose.customSkillSection}>
                                <Text style={stylesSkillsChoose.customSkillTitle}>Свой скилл</Text>
                                <View style={stylesSkillsChoose.searchContainer}>
                                    <TextInput
                                        style={stylesSkillsChoose.searchInput}
                                        value={customSkillInput}
                                        onChangeText={setCustomSkillInput}
                                        placeholder="...впишите здесь новый, если не нашли в перечне"
                                        placeholderTextColor="#999999"
                                        onSubmitEditing={handleAddCustomSkill}
                                    />
                                    <Pressable onPress={handleAddCustomSkill}>
                                        <Text style={stylesSkillsChoose.searchIcon}>+</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View style={stylesSkillsChoose.skillsGrid}>
                                {allSkillsWithCustom.map((skill) => {
                                    const isSelected = selectedSkills.includes(skill.id);
                                    return (
                                        <Pressable
                                            key={skill.id}
                                            style={[
                                                stylesSkillsChoose.skillButton,
                                                isSelected && stylesSkillsChoose.skillButtonSelected
                                            ]}
                                            onPress={() => toggleSkill(skill.id)}
                                        >
                                            {skill.name ? (
                                                <Text style={[
                                                    stylesSkillsChoose.skillText,
                                                    isSelected && stylesSkillsChoose.skillTextSelected
                                                ]}>
                                                    {skill.name}
                                                </Text>
                                            ) : null}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                ) : (
                    <SafeAreaView style={stylesExpectations.container}>
                        <View style={stylesExpectations.header}>
                            <Pressable
                                style={stylesExpectations.backButton}
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={stylesExpectations.backButtonText}>←</Text>
                            </Pressable>
                            <Pressable 
                                style={[
                                    stylesExpectations.continueButton,
                                    isSaving && { opacity: 0.6 }
                                ]}
                                onPress={handleSavePreferences}
                                disabled={isSaving}
                            >
                                <Text style={stylesExpectations.continueButtonText}>
                                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                                </Text>
                            </Pressable>
                        </View>
                        <ScrollView
                            contentContainerStyle={stylesExpectations.scrollContent}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            removeClippedSubviews={false}
                        >
                            <Text style={stylesExpectations.title}>Ваши Ожидания</Text>
                            <Text style={stylesExpectations.description}>
                                Расскажите о своих ожиданиях, мы подберем подходящие вакансии!
                            </Text>
                            
                            {/* Секция формата работы */}
                            <View style={stylesExpectations.section}>
                                <Text style={stylesExpectations.sectionTitle}>Формат работы</Text>
                                <View style={stylesExpectations.formatsContainer}>
                                    {allWorkFormation.map((format) => {
                                        const isSelected = workFormation.includes(format.id);
                                        return (
                                            <Pressable
                                                key={format.id}
                                                style={[
                                                    stylesExpectations.formatButton,
                                                    isSelected && stylesExpectations.formatButtonSelected
                                                ]}
                                                onPress={() => toggleWorkFormat(format.id)}
                                            >
                                                <Text style={[
                                                    stylesExpectations.formatText,
                                                    isSelected && stylesExpectations.formatTextSelected
                                                ]}>
                                                    {format.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                            
                            {/* Секция опыта работы */}
                            <View style={stylesExpectations.section}>
                                <Text style={stylesExpectations.sectionTitle}>Уровень и опыт</Text>
                                <View style={stylesExpectations.formatsContainer}>
                                    {allExperience.map((exp) => {
                                        const isSelected = experience === exp.id;
                                        return (
                                            <Pressable
                                                key={exp.id}
                                                style={[
                                                    stylesExpectations.formatButton,
                                                    isSelected && stylesExpectations.formatButtonSelected
                                                ]}
                                                onPress={() => handleExperienceChange(exp.id)}
                                            >
                                                <Text style={[
                                                    stylesExpectations.formatText,
                                                    isSelected && stylesExpectations.formatTextSelected
                                                ]}>
                                                    {exp.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                            
                            {/* Секция зарплаты */}
                            <View style={stylesExpectations.section}>
                                <Text style={stylesExpectations.sectionTitle}>Зарплата</Text>
                                <View style={stylesExpectations.salaryContainer}>
                                    <View style={stylesExpectations.salaryInputWrapper}>
                                        <Text style={stylesExpectations.salaryLabel}>От</Text>
                                        <TextInput
                                            style={stylesExpectations.inputSalary}
                                            value={salary[0] ? salary[0].toString() : ''}
                                            onChangeText={handleSalaryFromChange}
                                            placeholder="Введите сумму"
                                            placeholderTextColor="#999999"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={stylesExpectations.salaryInputWrapper}>
                                        <Text style={stylesExpectations.salaryLabel}>До</Text>
                                        <TextInput
                                            style={stylesExpectations.inputSalary}
                                            value={salary[1] ? salary[1].toString() : ''}
                                            onChangeText={handleSalaryToChange}
                                            placeholder="Введите сумму"
                                            placeholderTextColor="#999999"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={stylesExpectations.periodWrapper}>
                                        <Text style={stylesExpectations.salaryLabel}>Период</Text>
                                        <View style={stylesExpectations.periodContainer}>
                                            <Pressable
                                                style={stylesExpectations.periodButton}
                                                onPress={() => setShowPeriodDropdown(!showPeriodDropdown)}
                                            >
                                                <Text style={[
                                                    stylesExpectations.periodButtonText,
                                                    getPeriodName() !== 'Период' && stylesExpectations.periodButtonTextSelected
                                                ]}>
                                                    {getPeriodName()}
                                                </Text>
                                                <Text style={stylesExpectations.periodButtonArrow}>▼</Text>
                                            </Pressable>
                                            {showPeriodDropdown && (
                                                <View style={stylesExpectations.periodDropdown}>
                                                    <ScrollView
                                                        style={stylesExpectations.periodDropdownScroll}
                                                        nestedScrollEnabled={true}
                                                        showsVerticalScrollIndicator={true}
                                                    >
                                                        {[
                                                            { id: 'month', name: 'В месяц' },
                                                            { id: 'week', name: 'В неделю' },
                                                            { id: 'project', name: 'За проект' },
                                                            { id: 'hour', name: 'За час' },
                                                            { id: 'piecework', name: 'Сдельная оплата' },
                                                        ].map((period, index) => (
                                                            <Pressable
                                                                key={period.id}
                                                                style={[
                                                                    stylesExpectations.periodOption,
                                                                    salaryPeriod === period.id && stylesExpectations.periodOptionSelected,
                                                                    index === 4 && stylesExpectations.periodOptionLast
                                                                ]}
                                                                onPress={() => handlePeriodSelect(period.id)}
                                                            >
                                                                <Text style={[
                                                                    stylesExpectations.periodOptionText,
                                                                    salaryPeriod === period.id && stylesExpectations.periodOptionTextSelected
                                                                ]}>
                                                                    {period.name}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>

            {/* Bottom Navigation Bar */}
            <View style={homeStyles.bottomNav}>
                {/* Карточки (мэтчинг) */}
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

                {/* Сердце (избранные вакансии) */}
                <Pressable 
                    style={homeStyles.navItem}
                    onPress={() => navigation.navigate('SelectedVacancies' as never)}
                >
                    <View style={homeStyles.navIcon}>
                        <Text style={homeStyles.heartIcon}>♡</Text>
                        <View style={homeStyles.navDot} />
                    </View>
                </Pressable>

                {/* Профиль */}
                <Pressable 
                    style={homeStyles.navItem}
                    onPress={() => navigation.navigate('Profile' as never)}
                >
                    <View style={[homeStyles.navIcon, currentRouteName === 'Profile' && homeStyles.navIconActive]}>
                        <Text style={[homeStyles.profileIcon, currentRouteName === 'Profile' && {color: '#FFFFFF'}]}>👤</Text>
                    </View>
                    {currentRouteName === 'Profile' && <View style={homeStyles.navIndicator} />}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileSection: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarIcon: {
        fontSize: 48,
    },
    completionBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4131B6',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    completionText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    editButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
    },
    logoutButton: {
        backgroundColor: '#FFEAEA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FF3B30',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
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
    tabContent: {
        paddingHorizontal: 20,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    skillTag: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 8,
    },
    skillText: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    conditionSection: {
        marginBottom: 24,
    },
    conditionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    conditionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    arrowIcon: {
        fontSize: 20,
        color: '#999999',
    },
    conditionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    conditionButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    conditionButtonActive: {
        backgroundColor: '#4131B6',
    },
    conditionButtonText: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    conditionButtonTextActive: {
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
    },
    editButtonInTab: {
        backgroundColor: '#4131B6',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    editButtonInTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

