import {useEffect, useRef, useState} from 'react';
import {
    View,
    Pressable,
    Text,
    TextInput,
    ScrollView,
    SafeAreaView,
    Modal,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { stylesRegister } from "../../../../styles/register/style";

interface RegisterMainPageProps {
    name: string;
    surname: string;
    gender: string;
    email: string;
    birthday: string;
    showDatePicker: boolean;
    selectedYear: number;
    selectedMonth: number;
    selectedDay: number;
    validationErrors: {
        name?: string;
        surname?: string;
        gender?: string;
        birthday?: string;
        email?: string;
    };
    setName: (value: string) => void;
    setSurname: (value: string) => void;
    setGender: (value: string) => void;
    setEmail: (value: string) => void;
    setBirthday: (value: string) => void;
    setShowDatePicker: (value: boolean) => void;
    setSelectedYear: (value: number) => void;
    setSelectedMonth: (value: number) => void;
    setSelectedDay: (value: number) => void;
    handleGoBack: () => void;
    handleDatePress: () => void;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    handleSaveDate: () => void;
    renderCalendar: () => (number | null)[];
    handleContinue: () => void;
    monthNames: string[];
    isLoading?: boolean;
    showYearDropdown: boolean;
    setShowYearDropdown: (value: boolean) => void;
    generateYears: () => number[];
    handleYearSelect: (year: number) => void;
    showGenderDropdown: boolean;
    setShowGenderDropdown: (value: boolean) => void;
}

export default function RegisterMainPage({
    name,
    surname,
    gender,
    email,
    birthday,
    showDatePicker,
    selectedYear,
    selectedMonth,
    selectedDay,
    validationErrors,
    setName,
    setSurname,
    setGender,
    setEmail,
    setBirthday,
    setShowDatePicker,
    setSelectedYear,
    setSelectedMonth,
    setSelectedDay,
    handleGoBack,
    handleDatePress,
    handlePrevMonth,
    handleNextMonth,
    handleSaveDate,
    renderCalendar,
    handleContinue,
    monthNames,
    isLoading = false,
    showYearDropdown,
    setShowYearDropdown,
    generateYears,
    handleYearSelect,
    showGenderDropdown,
    setShowGenderDropdown
}: RegisterMainPageProps) {
    const scrollRef = useRef<ScrollView>(null);
    const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const onShow = (e: {endCoordinates: {height: number}}) =>
            setKeyboardBottomInset(e.endCoordinates.height);
        const onHide = () => setKeyboardBottomInset(0);
        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const scrollEmailIntoView = () => {
        requestAnimationFrame(() => {
            setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 120);
        });
    };

    return (
        <SafeAreaView style={stylesRegister.container}>
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
            <Pressable 
                style={{ flex: 1 }}
                onPress={() => setShowGenderDropdown(false)}
            >
            <Pressable 
                style={stylesRegister.backButton} 
                onPress={(e) => {
                    e.stopPropagation();
                    handleGoBack();
                }}
            >
                <Text style={stylesRegister.backButtonText}>←</Text>
            </Pressable>
            <ScrollView
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                    stylesRegister.scrollContent,
                    Platform.OS === 'android' &&
                        keyboardBottomInset > 0 && {
                            paddingBottom: keyboardBottomInset + 40,
                        },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={stylesRegister.title}>
                    Введите данные о себе
                </Text>

                <View style={stylesRegister.formContainer}>
                    {/* Имя */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Имя</Text>
                        <TextInput
                            style={[
                                stylesRegister.input,
                                validationErrors.name && stylesRegister.inputError
                            ]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Введите имя"
                            placeholderTextColor="#999999"
                            autoCapitalize="words"
                            textContentType="givenName"
                            autoCorrect={false}
                        />
                        {validationErrors.name && (
                            <Text style={stylesRegister.errorText}>{validationErrors.name}</Text>
                        )}
                    </View>

                    {/* Фамилия */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Фамилия</Text>
                        <TextInput
                            style={[
                                stylesRegister.input,
                                validationErrors.surname && stylesRegister.inputError
                            ]}
                            value={surname}
                            onChangeText={setSurname}
                            placeholder="Введите фамилию"
                            placeholderTextColor="#999999"
                            autoCapitalize="words"
                            textContentType="familyName"
                            autoCorrect={false}
                        />
                        {validationErrors.surname && (
                            <Text style={stylesRegister.errorText}>{validationErrors.surname}</Text>
                        )}
                    </View>

                    {/* Пол */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Пол</Text>
                        <View style={stylesRegister.genderDropdownContainer}>
                            <Pressable
                                style={[
                                    stylesRegister.genderDropdownButton,
                                    validationErrors.gender && stylesRegister.inputError
                                ]}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowGenderDropdown(!showGenderDropdown);
                                }}
                            >
                                <Text style={[
                                    stylesRegister.genderDropdownButtonText,
                                    !gender && stylesRegister.genderDropdownPlaceholder
                                ]}>
                                    {gender || "Выберите пол"}
                                </Text>
                                <Text style={stylesRegister.genderDropdownArrow}>
                                    {showGenderDropdown ? '▲' : '▼'}
                                </Text>
                            </Pressable>
                            {showGenderDropdown && (
                                <Pressable 
                                    style={stylesRegister.genderDropdownList}
                                    onPress={(e) => e.stopPropagation()}
                                >
                                    <Pressable
                                        style={[
                                            stylesRegister.genderOption,
                                            gender === 'Мужской' && stylesRegister.genderOptionSelected
                                        ]}
                                        onPress={() => {
                                            setGender('Мужской');
                                            setShowGenderDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            stylesRegister.genderOptionText,
                                            gender === 'Мужской' && stylesRegister.genderOptionTextSelected
                                        ]}>
                                            Мужской
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[
                                            stylesRegister.genderOption,
                                            gender === 'Женский' && stylesRegister.genderOptionSelected
                                        ]}
                                        onPress={() => {
                                            setGender('Женский');
                                            setShowGenderDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            stylesRegister.genderOptionText,
                                            gender === 'Женский' && stylesRegister.genderOptionTextSelected
                                        ]}>
                                            Женский
                                        </Text>
                                    </Pressable>
                                </Pressable>
                            )}
                        </View>
                        {validationErrors.gender && (
                            <Text style={stylesRegister.errorText}>{validationErrors.gender}</Text>
                        )}
                    </View>

                    {/* Дата рождения */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Дата рождения</Text>
                        <Pressable 
                            style={[
                                stylesRegister.dateButton,
                                validationErrors.birthday && stylesRegister.inputError
                            ]} 
                            onPress={handleDatePress}
                        >
                            <Text style={stylesRegister.dateButtonText}>
                                {birthday || "Выберите дату рождения"}
                            </Text>
                        </Pressable>
                        {validationErrors.birthday && (
                            <Text style={stylesRegister.errorText}>{validationErrors.birthday}</Text>
                        )}
                    </View>

                    {/* email */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Email</Text>
                        <TextInput
                            style={[
                                stylesRegister.input,
                                validationErrors.email && stylesRegister.inputError
                            ]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@mail.com"
                            placeholderTextColor="#999999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={scrollEmailIntoView}
                        />
                        {validationErrors.email && (
                            <Text style={stylesRegister.errorText}>{validationErrors.email}</Text>
                        )}
                    </View>
                </View>

                {/* Кнопка Продолжить */}
                <Pressable 
                    style={[
                        stylesRegister.continueButton,
                        isLoading && { opacity: 0.6 }
                    ]} 
                    onPress={handleContinue}
                    disabled={isLoading}
                >
                    <Text style={stylesRegister.continueButtonText}>
                        {isLoading ? 'Загрузка...' : 'Продолжить'}
                    </Text>
                    {!isLoading && <Text style={{ color: '#FFFFFF', fontSize: 16 }}>→</Text>}
                </Pressable>
            </ScrollView>
            </Pressable>
            </KeyboardAvoidingView>

            {/* Модальное окно выбора даты */}
            {/* Модальное окно выбора даты */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowDatePicker(false);
                    setShowYearDropdown(false);
                }}
            >
                {/* затемнение + закрытие по тапу вне */}
                <Pressable
                    style={stylesRegister.modalOverlay}
                    onPress={() => {
                        setShowDatePicker(false);
                        setShowYearDropdown(false);
                    }}
                >
                    {/* контент sheet, stopPropagation чтобы не закрывать */}
                    <Pressable
                        style={stylesRegister.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header: стрелки + год (кликабельный) + месяц */}
                        <View style={stylesRegister.sheetHeader}>
                            <Pressable onPress={handlePrevMonth} style={stylesRegister.chevronBtn}>
                                <Text style={stylesRegister.chevron}>‹</Text>
                            </Pressable>

                            <View style={stylesRegister.centerHeader}>
                                <Text style={stylesRegister.modalTitleSmall}>День рождения</Text>

                                <Pressable
                                    onPress={() => setShowYearDropdown(!showYearDropdown)}
                                    style={stylesRegister.yearTapArea}
                                >
                                    <Text style={stylesRegister.yearBig}>{selectedYear}</Text>
                                </Pressable>

                                <Text style={stylesRegister.monthText}>{monthNames[selectedMonth]}</Text>
                            </View>

                            <Pressable onPress={handleNextMonth} style={stylesRegister.chevronBtn}>
                                <Text style={stylesRegister.chevron}>›</Text>
                            </Pressable>
                        </View>

                        {/* Календарь */}
                        <View style={stylesRegister.calendarContainer}>
                            <View style={stylesRegister.calendarGrid}>
                                {renderCalendar().map((day, index) => (
                                    <Pressable
                                        key={index}
                                        style={[
                                            stylesRegister.calendarDay,
                                            day === selectedDay && stylesRegister.calendarDaySelected,
                                            day === null && stylesRegister.calendarDayEmpty,
                                        ]}
                                        onPress={() => day && setSelectedDay(day)}
                                        disabled={day === null}
                                    >
                                        <Text
                                            style={[
                                                stylesRegister.calendarDayText,
                                                day === selectedDay && stylesRegister.calendarDayTextSelected,
                                            ]}
                                        >
                                            {day || ''}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Кнопка Сохранить */}
                        <Pressable style={stylesRegister.saveButton} onPress={handleSaveDate}>
                            <Text style={stylesRegister.saveButtonText}>Сохранить</Text>
                        </Pressable>

                        {/* Dropdown лет поверх календаря (как на правом мокапе) */}
                        {showYearDropdown && (
                            <Pressable
                                style={stylesRegister.yearDropdownOverlay}
                                onPress={() => setShowYearDropdown(false)}
                            >
                                <Pressable
                                    style={stylesRegister.yearDropdownCard}
                                    onPress={(e) => e.stopPropagation()}
                                >
                                    <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled>
                                        {generateYears().map((year) => (
                                            <Pressable
                                                key={year}
                                                style={[
                                                    stylesRegister.yearRow,
                                                    year === selectedYear && stylesRegister.yearRowSelected,
                                                ]}
                                                onPress={() => handleYearSelect(year)}
                                            >
                                                <Text
                                                    style={[
                                                        stylesRegister.yearRowText,
                                                        year === selectedYear && stylesRegister.yearRowTextSelected,
                                                    ]}
                                                >
                                                    {year}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </Pressable>
                            </Pressable>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
