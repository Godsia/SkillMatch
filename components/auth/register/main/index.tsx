import {View, Pressable, Text, TextInput, ScrollView, SafeAreaView, Modal} from 'react-native';
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
    monthNames
}: RegisterMainPageProps) {
    return (
        <SafeAreaView style={stylesRegister.container}>
            <Pressable 
                style={stylesRegister.backButton} 
                onPress={handleGoBack}
            >
                <Text style={stylesRegister.backButtonText}>←</Text>
            </Pressable>
            <ScrollView 
                contentContainerStyle={stylesRegister.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={stylesRegister.title}>
                    Введите Данные О Себе
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
                        />
                        {validationErrors.surname && (
                            <Text style={stylesRegister.errorText}>{validationErrors.surname}</Text>
                        )}
                    </View>

                    {/* Пол */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Пол</Text>
                        <TextInput
                            style={[
                                stylesRegister.input,
                                validationErrors.gender && stylesRegister.inputError
                            ]}
                            value={gender}
                            onChangeText={setGender}
                            placeholder="Введите пол"
                            placeholderTextColor="#999999"
                        />
                        {validationErrors.gender && (
                            <Text style={stylesRegister.errorText}>{validationErrors.gender}</Text>
                        )}
                    </View>

                    {/* Дата рождения */}
                    <View style={stylesRegister.inputGroup}>
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
                        />
                        {validationErrors.email && (
                            <Text style={stylesRegister.errorText}>{validationErrors.email}</Text>
                        )}
                    </View>
                </View>

                {/* Кнопка Продолжить */}
                <Pressable style={stylesRegister.continueButton} onPress={handleContinue}>
                    <Text style={stylesRegister.continueButtonText}>Продолжить</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>→</Text>
                </Pressable>
            </ScrollView>

            {/* Модальное окно выбора даты */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <Pressable 
                    style={stylesRegister.modalOverlay}
                    onPress={() => setShowDatePicker(false)}
                >
                    <Pressable 
                        style={stylesRegister.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={stylesRegister.modalTitle}>День рождения</Text>
                        
                        {/* Выбор года и месяца */}
                        <View style={stylesRegister.dateSelector}>
                            <Pressable onPress={handlePrevMonth}>
                                <Text style={stylesRegister.arrowButton}>←</Text>
                            </Pressable>
                            <View style={stylesRegister.dateDisplay}>
                                <Text style={stylesRegister.yearText}>{selectedYear}</Text>
                                <Text style={stylesRegister.monthText}>{monthNames[selectedMonth]}</Text>
                            </View>
                            <Pressable onPress={handleNextMonth}>
                                <Text style={stylesRegister.arrowButton}>→</Text>
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
                                            day === null && stylesRegister.calendarDayEmpty
                                        ]}
                                        onPress={() => day && setSelectedDay(day)}
                                        disabled={day === null}
                                    >
                                        <Text style={[
                                            stylesRegister.calendarDayText,
                                            day === selectedDay && stylesRegister.calendarDayTextSelected
                                        ]}>
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
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
