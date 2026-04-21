import {Pressable, SafeAreaView, ScrollView, Text, TextInput, View} from "react-native";
import {stylesSkillsChoose} from "../../../../styles/register/style";
import {allSkills} from "../../../../data/skills";
import {useState} from "react";

interface SkillsPageProps {
    handleGoBack: () => void;
    handleSkip: () => void;
    handleContinue: () => void;
    selectedSkills: string[];
    setSelectedSkills: (skills: string[]) => void;
    customSkills: Array<{id: string, name: string}>;
    setCustomSkills: (skills: Array<{id: string, name: string}>) => void;
    isLoading?: boolean;
}

export default function SkillsPage({ handleGoBack, handleSkip, handleContinue, selectedSkills, setSelectedSkills, customSkills, setCustomSkills, isLoading = false }: SkillsPageProps) {
    const [customSkillInput, setCustomSkillInput] = useState<string>("");

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
            setCustomSkills([newSkill, ...customSkills]);
            setSelectedSkills([newSkillId, ...selectedSkills]);
            setCustomSkillInput("");
        }
    };

    const allSkillsWithCustom = [...customSkills, ...allSkills];

    return (
        <SafeAreaView style={stylesSkillsChoose.container}>
            <View style={stylesSkillsChoose.header}>
                <Pressable
                    style={stylesSkillsChoose.backButton}
                    onPress={handleGoBack}
                >
                    <Text style={stylesSkillsChoose.backButtonText}>←</Text>
                </Pressable>
                <Pressable 
                    style={[
                        stylesSkillsChoose.skipButton,
                        isLoading && { opacity: 0.6 }
                    ]}
                    onPress={handleSkip}
                    disabled={isLoading}
                >
                    <Text style={stylesSkillsChoose.skipButtonText}>Пропустить</Text>
                </Pressable>
            </View>
            <ScrollView
                contentContainerStyle={stylesSkillsChoose.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={stylesSkillsChoose.title}>Ваши скиллы</Text>
                <Text style={stylesSkillsChoose.description}>
                    Отметьте свои навыки, и мы найдём для вас лучшее предложение!
                </Text>
                {/* Секция для добавления собственного навыка */}
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

                {/* Кнопка Продолжить в конце страницы */}
                <Pressable 
                    style={[
                        stylesSkillsChoose.continueButtonBottom,
                        isLoading && { opacity: 0.6 }
                    ]}
                    onPress={handleContinue}
                    disabled={isLoading}
                >
                    <Text style={stylesSkillsChoose.continueButtonText}>
                        {isLoading ? 'Загрузка...' : 'Продолжить'}
                    </Text>
                    {!isLoading && <Text style={stylesSkillsChoose.continueButtonArrow}>→</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
