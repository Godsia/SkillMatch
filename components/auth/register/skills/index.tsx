import {Pressable, SafeAreaView, ScrollView, Text, TextInput, View} from "react-native";
import {stylesSkillsChoose} from "../../../../styles/register/style";
import {allSkills} from "../../../../data/skills";
import {useState} from "react";

interface SkillsPageProps {
    handleGoBack: () => void;
    handleContinue: () => void;
    selectedSkills: string[];
    setSelectedSkills: (skills: string[]) => void;
    customSkills: Array<{id: string, name: string}>;
    setCustomSkills: (skills: Array<{id: string, name: string}>) => void;
}

export default function SkillsPage({ handleGoBack, handleContinue, selectedSkills, setSelectedSkills, customSkills, setCustomSkills }: SkillsPageProps) {
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
            setCustomSkills([...customSkills, newSkill]);
            setSelectedSkills([...selectedSkills, newSkillId]);
            setCustomSkillInput("");
        }
    };

    const allSkillsWithCustom = [...allSkills, ...customSkills];

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
                    style={stylesSkillsChoose.continueButton}
                    onPress={handleContinue}
                >
                    <Text style={stylesSkillsChoose.continueButtonText}>Пропустить</Text>
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
                            <Text style={stylesSkillsChoose.searchIcon}>🔍</Text>
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
    );
}
