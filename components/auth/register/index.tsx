import {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import RegisterMainPage from "./main";
import VerificationPage from "./verification";
import PasswordPage from "./password";
import SkillsPage from "./skills";
import ExpectationsPage from "./expectations";

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

    // Данные для выбора даты
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<number>(1995);
    const [selectedMonth, setSelectedMonth] = useState<number>(6);
    const [selectedDay, setSelectedDay] = useState<number>(11);

    // Данные для верификации
    const [verificationCode, setVerificationCode] = useState<string>("");

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
    const [experience, setExperience] = useState<string>("");
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

        if (!gender.trim()) {
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


    const handleMainContinue = () => {
        if (validateMainForm()) {
            setCurrentStep('verification');
        }
    };

    const handleVerificationSuccess = () => {
        setCurrentStep('password');
    };

    const handlePasswordContinue = () => {
        if (validatePasswords(password, confirmPassword)) {
            setCurrentStep('skills');
        }
    };

    const handleExpectationsContinue = () => {
        console.log('Регистрация завершена', {
            name,
            surname,
            gender,
            email,
            birthday,
            password,
            selectedSkills,
            customSkills,
            workFormation,
            experience,
            salary,
            salaryPeriod
        });
        // navigation.navigate('NextScreen' as never);
    };

    const handleSkillsContinue = () => {
        setCurrentStep('expectations');
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
                    handleContinue={handleSkillsContinue}
                    selectedSkills={selectedSkills}
                    setSelectedSkills={setSelectedSkills}
                    customSkills={customSkills}
                    setCustomSkills={setCustomSkills}
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
                />
            ) : null}
        </>
    );
}
