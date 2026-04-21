import {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {Alert} from "react-native";
import RegisterMainPage from "./main";
import VerificationPage from "./verification";
import PasswordPage from "./password";
import SkillsPage from "./skills";
import ExpectationsPage from "./expectations";
import {authApi, setAccessToken} from "../../../services/api";
import {allSkills} from "../../../data/skills";

const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

type RegisterStep = 'main' | 'verification' | 'password' | 'skills' | 'expectations';

export default function RegisterRootComponent() {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState<RegisterStep>('main');

    // Основные данные регистрации
    const [name, setName] = useState<string>("");
    const [surname, setSurname] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [birthday, setBirthday] = useState<string>("");
    const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);

    // Данные для выбора даты
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<number>(1995);
    const [selectedMonth, setSelectedMonth] = useState<number>(6);
    const [selectedDay, setSelectedDay] = useState<number>(11);
    const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);

    // Данные для верификации
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [storedAccessToken, setStoredAccessToken] = useState<string | null>(null);

    // Ошибки валидации для основной формы
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        surname?: string;
        gender?: string;
        birthday?: string;
        email?: string;
    }>({});

    // Данные для пароля
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");

    // Данные для навыков
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [customSkills, setCustomSkills] = useState<Array<{id: string, name: string}>>([]);

    //Данные для ожиданий по работе
    const [workFormation, setWorkFormation] = useState<string[]>([]);
    const [experience, setExperience] = useState<string[]>([]);
    const [salary, setSalary] = useState<number[]>([]);
    const [salaryPeriod, setSalaryPeriod] = useState<string>("");

    // Методы для работы с датой
    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number): number => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const handleSaveDate = () => {
        const formattedDate = `${selectedDay} ${monthNames[selectedMonth]} ${selectedYear}`;
        setBirthday(formattedDate);
        setShowDatePicker(false);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
        const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        
        return days;
    };

    // Генерация списка годов (от 1950 до текущего года)
    const generateYears = (): number[] => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = currentYear; year >= 1950; year--) {
            years.push(year);
        }
        return years;
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setShowYearDropdown(false);
        // Проверяем, что выбранный день существует в новом году
        const daysInMonth = getDaysInMonth(year, selectedMonth);
        if (selectedDay > daysInMonth) {
            setSelectedDay(daysInMonth);
        }
    };

    // Валидация основной формы регистрации
    const validateMainForm = () => {
        const errors: {
            name?: string;
            surname?: string;
            gender?: string;
            birthday?: string;
            email?: string;
        } = {};

        if (!name.trim()) {
            errors.name = "Имя обязательно для заполнения";
        }

        if (!surname.trim()) {
            errors.surname = "Фамилия обязательна для заполнения";
        }

        const genderNorm = gender.trim().toLowerCase();
        if (!genderNorm || (genderNorm !== 'мужской' && genderNorm !== 'женский')) {
            errors.gender = "Пол обязателен для заполнения";
        }

        if (!birthday.trim()) {
            errors.birthday = "Дата рождения обязательна для заполнения";
        }

        if (!email.trim()) {
            errors.email = "Email обязателен для заполнения";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.email = "Введите корректный email";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Методы для валидации паролей
    const validatePasswords = (pass: string, confirm: string) => {
        if (!pass && !confirm) {
            setPasswordError("");
            return false;
        }
        
        if (!pass || pass.length < 6) {
            setPasswordError("Пароль должен содержать минимум 6 символов");
            return false;
        }
        
        if (pass !== confirm) {
            setPasswordError("Пароли не совпадают");
            return false;
        }
        
        setPasswordError("");
        return true;
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (confirmPassword) {
            validatePasswords(text, confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (password) {
            validatePasswords(password, text);
        }
    };

    // Навигация между шагами
    const handleGoBack = () => {
        if (currentStep === 'verification') {
            setCurrentStep('main');
        } else if (currentStep === 'password') {
            setCurrentStep('main');
        } else if (currentStep === 'skills') {
            setCurrentStep('password');
        } else if (currentStep === 'expectations') {
            setCurrentStep('skills');
        } else {
            navigation.goBack();
        }
    };


    // Преобразование даты из формата "11 июля 1995" в "1995-07-11"
    const formatDateForAPI = (dateString: string): string => {
        const parts = dateString.split(' ');
        if (parts.length !== 3) return '';
        
        const day = parseInt(parts[0], 10);
        const monthName = parts[1];
        const year = parseInt(parts[2], 10);
        
        const monthIndex = monthNames.findIndex(m => m === monthName);
        if (monthIndex === -1) return '';
        
        const month = (monthIndex + 1).toString().padStart(2, '0');
        const dayFormatted = day.toString().padStart(2, '0');
        
        return `${year}-${month}-${dayFormatted}`;
    };

    const handleMainContinue = async () => {
        if (!validateMainForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const formattedDate = formatDateForAPI(birthday);
            if (!formattedDate) {
                Alert.alert("Ошибка", "Неверный формат даты");
                setIsLoading(false);
                return;
            }

            // Преобразование пола: мужской -> Male, женский -> Female
            const genderMapping: { [key: string]: string } = {
                'мужской': 'Male',
                'женский': 'Female'
            };
            const genderForAPI = genderMapping[gender.toLowerCase()] || gender.toUpperCase();

            const response = await authApi.registerInit({
                firstName: name,
                lastName: surname,
                gender: genderForAPI,
                birthDate: formattedDate,
                email: email,
            });

            // Сохраняем accessToken для использования в заголовках API
            console.log('=== Сохранение accessToken после регистрации ===');
            console.log('accessToken:', response.accessToken ? `${response.accessToken.substring(0, 20)}...` : 'null');
            console.log('userStatus:', response.userStatus);
            console.log('message:', response.message);
            setAccessToken(response.accessToken);
            setStoredAccessToken(response.accessToken); // Сохраняем также в состоянии компонента
            console.log('accessToken сохранен для API запросов');
            console.log('===========================================');
            setCurrentStep('verification');
        } catch (error: any) {
            console.error('Ошибка регистрации:', error);
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось начать регистрацию. Попробуйте еще раз."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSuccess = () => {
        setCurrentStep('password');
    };

    const handlePasswordContinue = () => {
        // Логика установки пароля и логина теперь в компоненте PasswordPage
        setCurrentStep('skills');
    };

    const handleExpectationsContinue = async () => {
        setIsLoading(true);
        try {
            // Восстанавливаем токен в заголовках, если он был сохранен в состоянии
            if (storedAccessToken) {
                console.log('=== Восстановление accessToken перед отправкой предпочтений ===');
                setAccessToken(storedAccessToken);
                console.log('accessToken восстановлен');
                console.log('===========================================================');
            }
            
            console.log('=== Отправка предпочтений ===');

            // Преобразуем данные в формат API
            const preferencesData = {
                workFormats: workFormation.join(','),
                experienceLevel: experience.join(','),
                salaryFrom: salary[0] || 0,
                salaryTo: salary[1] || 0,
                salaryPeriod: salaryPeriod || ''
            };

            console.log('Отправка предпочтений:', JSON.stringify(preferencesData, null, 2));

            await authApi.setPreferences(preferencesData);

            navigation.navigate('Home' as never);
        } catch (error: any) {
            console.error('Ошибка сохранения предпочтений:', error);
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось сохранить предпочтения. Попробуйте еще раз."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkillsSkip = async () => {
        // Очищаем выбранные скиллы при пропуске
        setSelectedSkills([]);
        setCustomSkills([]);
        setCurrentStep('expectations');
    };

    const handleSkillsContinue = async () => {
        setIsLoading(true);
        try {
            // Восстанавливаем токен в заголовках, если он был сохранен в состоянии
            if (storedAccessToken) {
                console.log('=== Восстановление accessToken перед отправкой навыков ===');
                setAccessToken(storedAccessToken);
                console.log('accessToken восстановлен');
                console.log('========================================================');
            }
            
            console.log('=== Отправка навыков ===');

            // Преобразуем выбранные навыки в формат API
            // Все навыки отправляем только через customSkill, без skillId
            const skillsForAPI = selectedSkills.map(skillId => {
                // Проверяем, является ли навык кастомным
                const customSkill = customSkills.find(cs => cs.id === skillId);
                if (customSkill) {
                    return {
                        customSkill: customSkill.name
                    };
                }
                
                // Для обычных навыков ищем название
                const skill = allSkills.find(s => s.id === skillId);
                return {
                    customSkill: skill?.name || skillId
                };
            });

            console.log('Отправка навыков:', JSON.stringify({ skills: skillsForAPI }, null, 2));

            await authApi.setSkills({
                skills: skillsForAPI
            });

            setCurrentStep('expectations');
        } catch (error: any) {
            console.error('Ошибка сохранения навыков:', error);
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось сохранить навыки. Попробуйте еще раз."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isPasswordFormValid = password.length >= 6 && password === confirmPassword && !passwordError;

    return (
        <>
            {currentStep === 'main' ? (
                <RegisterMainPage
                    name={name}
                    surname={surname}
                    gender={gender}
                    email={email}
                    birthday={birthday}
                    showDatePicker={showDatePicker}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedDay={selectedDay}
                    validationErrors={validationErrors}
                    setName={(value) => {
                        setName(value);
                        if (validationErrors.name) {
                            setValidationErrors({ ...validationErrors, name: undefined });
                        }
                    }}
                    setSurname={(value) => {
                        setSurname(value);
                        if (validationErrors.surname) {
                            setValidationErrors({ ...validationErrors, surname: undefined });
                        }
                    }}
                    setGender={(value) => {
                        setGender(value);
                        if (validationErrors.gender) {
                            setValidationErrors({ ...validationErrors, gender: undefined });
                        }
                    }}
                    setEmail={(value) => {
                        setEmail(value);
                        if (validationErrors.email) {
                            setValidationErrors({ ...validationErrors, email: undefined });
                        }
                    }}
                    setBirthday={(value) => {
                        setBirthday(value);
                        if (validationErrors.birthday) {
                            setValidationErrors({ ...validationErrors, birthday: undefined });
                        }
                    }}
                    setShowDatePicker={setShowDatePicker}
                    setSelectedYear={setSelectedYear}
                    setSelectedMonth={setSelectedMonth}
                    setSelectedDay={setSelectedDay}
                    handleGoBack={handleGoBack}
                    handleDatePress={() => setShowDatePicker(true)}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                    handleSaveDate={handleSaveDate}
                    renderCalendar={renderCalendar}
                    handleContinue={handleMainContinue}
                    monthNames={monthNames}
                    isLoading={isLoading}
                    showYearDropdown={showYearDropdown}
                    setShowYearDropdown={setShowYearDropdown}
                    generateYears={generateYears}
                    handleYearSelect={handleYearSelect}
                    showGenderDropdown={showGenderDropdown}
                    setShowGenderDropdown={setShowGenderDropdown}
                />
            ) : currentStep === 'verification' ? (
                <VerificationPage
                    verificationCode={verificationCode}
                    setVerificationCode={setVerificationCode}
                    handleGoBack={handleGoBack}
                    onVerificationSuccess={handleVerificationSuccess}
                />
            ) : currentStep === 'password' ? (
                <PasswordPage
                    password={password}
                    confirmPassword={confirmPassword}
                    passwordError={passwordError}
                    handlePasswordChange={handlePasswordChange}
                    handleConfirmPasswordChange={handleConfirmPasswordChange}
                    handleContinue={handlePasswordContinue}
                    handleGoBack={handleGoBack}
                    isFormValid={isPasswordFormValid}
                />
            ) : currentStep === 'skills' ? (
                <SkillsPage
                    handleGoBack={handleGoBack}
                    handleSkip={handleSkillsSkip}
                    handleContinue={handleSkillsContinue}
                    selectedSkills={selectedSkills}
                    setSelectedSkills={setSelectedSkills}
                    customSkills={customSkills}
                    setCustomSkills={setCustomSkills}
                    isLoading={isLoading}
                />
            ) : currentStep === 'expectations' ? (
                <ExpectationsPage
                    handleGoBack={handleGoBack}
                    handleContinue={handleExpectationsContinue}
                    workFormation={workFormation}
                    experience={experience}
                    salary={salary}
                    salaryPeriod={salaryPeriod}
                    setWorkFormation={setWorkFormation}
                    setExperience={setExperience}
                    setSalary={setSalary}
                    setSalaryPeriod={setSalaryPeriod}
                    isLoading={isLoading}
                />
            ) : null}
        </>
    );
}
