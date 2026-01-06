import {Pressable, SafeAreaView, ScrollView, Text, TextInput, View, Modal} from "react-native";
import {stylesExpectations} from "../../../../styles/register/style";
import {allExperience, allWorkFormation} from "../../../../data/expectations";
import {useState} from "react";

interface ExpectationsPageProps {
    handleGoBack: () => void;
    handleContinue: () => void;
    workFormation: string[];
    experience: string;
    salary: number[];
    salaryPeriod: string;
    setWorkFormation: (value: string[]) => void;
    setExperience: (value: string) => void;
    setSalary: (value: number[]) => void;
    setSalaryPeriod: (value: string) => void;
}

const salaryPeriods = [
    { id: 'month', name: 'В месяц' },
    { id: 'week', name: 'В неделю' },
    { id: 'project', name: 'За проект' },
    { id: 'hour', name: 'За час' },
    { id: 'piecework', name: 'Сдельная оплата' },
];

export default function ExpectationsPage({
    handleGoBack,
    handleContinue,
    workFormation,
    experience,
    salary,
    salaryPeriod,
    setWorkFormation,
    setExperience,
    setSalary,
    setSalaryPeriod
}: ExpectationsPageProps) {
    const [showPeriodDropdown, setShowPeriodDropdown] = useState<boolean>(false);
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
        const period = salaryPeriods.find(p => p.id === salaryPeriod);
        return period ? period.name : 'Период';
    };

    return (
        <SafeAreaView style={stylesExpectations.container}>
            <View style={stylesExpectations.header}>
                <Pressable
                    style={stylesExpectations.backButton}
                    onPress={handleGoBack}
                >
                    <Text style={stylesExpectations.backButtonText}>←</Text>
                </Pressable>
                <Pressable
                    style={stylesExpectations.continueButton}
                    onPress={handleContinue}
                >
                    <Text style={stylesExpectations.continueButtonText}>Пропустить</Text>
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
                    <View style={stylesExpectations.formatsContainer} >
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
                                            {salaryPeriods.map((period, index) => (
                                                <Pressable
                                                    key={period.id}
                                                    style={[
                                                        stylesExpectations.periodOption,
                                                        salaryPeriod === period.id && stylesExpectations.periodOptionSelected,
                                                        index === salaryPeriods.length - 1 && stylesExpectations.periodOptionLast
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
    );
}