import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import type { Vacancy } from '../../services/api';

function formatSalary(vacancy: Vacancy): string {
    if (!vacancy.salaryFrom && !vacancy.salaryTo) return 'Зарплата не указана';
    const from = vacancy.salaryFrom ? vacancy.salaryFrom.toLocaleString('ru-RU') : '';
    const to = vacancy.salaryTo ? vacancy.salaryTo.toLocaleString('ru-RU') : '';
    const currency = vacancy.salaryCurrency || '₽';
    const gross = vacancy.salaryGross ? ' до вычета налогов' : ' на руки';
    if (from && to) return `${from} - ${to} ${currency}${gross}`;
    if (from) return `от ${from} ${currency}${gross}`;
    if (to) return `до ${to} ${currency}${gross}`;
    return '';
}

type VacancyCardProps = {
    vacancy: Vacancy;
    onPress?: () => void;
};

export default function VacancyCard({ vacancy, onPress }: VacancyCardProps) {
    return (
        <Pressable style={[styles.jobCard, styles.jobCardOverride]} onPress={onPress}>
            {vacancy.employerLogoUrl ? (
                <>
                    <View style={styles.backgroundContainer}>
                        <Image
                            source={{ uri: vacancy.employerLogoUrl }}
                            style={styles.backgroundImage}
                            resizeMode="cover"
                        />
                        <BlurView style={styles.backgroundBlur} intensity={90} tint="dark" />
                        <View style={styles.backgroundOverlay} />
                    </View>
                    <View style={styles.cardContent}>
                        <View style={[styles.matchBadge, styles.matchBadgePosition]}>
                            <AnimatedCircularProgress
                                size={36}
                                width={3}
                                fill={vacancy.matchPercent ?? 0}
                                tintColor="#FFFFFF"
                                backgroundColor="rgba(255,255,255,0.3)"
                                rotation={0}
                            >
                                {() => (
                                    <Text style={styles.matchPercentText}>
                                        {Math.round(vacancy.matchPercent ?? 0)}%
                                    </Text>
                                )}
                            </AnimatedCircularProgress>
                            <Text style={styles.matchText}>Мэтч</Text>
                        </View>
                        <Image
                            source={{ uri: vacancy.employerLogoUrl }}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.companyName} numberOfLines={1}>
                            {vacancy.employerName}
                        </Text>
                        <Text style={styles.jobTitle} numberOfLines={2}>
                            {vacancy.title}
                        </Text>
                        <View style={styles.jobInfoContainer}>
                            {vacancy.areaName && (
                                <Text style={styles.jobInfoText} numberOfLines={1}>
                                    {vacancy.areaName}
                                </Text>
                            )}
                            {formatSalary(vacancy) !== 'Зарплата не указана' && (
                                <Text style={styles.jobInfoText} numberOfLines={1}>
                                    {vacancy.areaName ? ' • ' : ''}{formatSalary(vacancy)}
                                </Text>
                            )}
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View style={[styles.backgroundContainer, styles.cardBackgroundFallback]} />
                    <View style={styles.cardContent}>
                        <View style={[styles.matchBadge, styles.matchBadgePosition]}>
                            <AnimatedCircularProgress
                                size={36}
                                width={3}
                                fill={vacancy.matchPercent ?? 0}
                                tintColor="#FFFFFF"
                                backgroundColor="rgba(255,255,255,0.3)"
                                rotation={0}
                            >
                                {() => (
                                    <Text style={styles.matchPercentText}>
                                        {Math.round(vacancy.matchPercent ?? 0)}%
                                    </Text>
                                )}
                            </AnimatedCircularProgress>
                            <Text style={styles.matchText}>Мэтч</Text>
                        </View>
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoPlaceholderText}>
                                {vacancy.employerName?.charAt(0)?.toUpperCase() ?? '?'}
                            </Text>
                        </View>
                        <Text style={styles.companyName} numberOfLines={1}>
                            {vacancy.employerName}
                        </Text>
                        <Text style={styles.jobTitle} numberOfLines={2}>
                            {vacancy.title}
                        </Text>
                        <View style={styles.jobInfoContainer}>
                            {vacancy.areaName && (
                                <Text style={styles.jobInfoText} numberOfLines={1}>
                                    {vacancy.areaName}
                                </Text>
                            )}
                            {formatSalary(vacancy) !== 'Зарплата не указана' && (
                                <Text style={styles.jobInfoText} numberOfLines={1}>
                                    {vacancy.areaName ? ' • ' : ''}{formatSalary(vacancy)}
                                </Text>
                            )}
                        </View>
                    </View>
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    jobCard: {
        backgroundColor: 'transparent',
        borderRadius: 40,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
    },
    jobCardOverride: {
        overflow: 'hidden',
        width: '100%',
        alignSelf: 'stretch',
        height: 520,
        minHeight: 520,
        elevation: 5,
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
    matchBadge: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    matchBadgePosition: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        zIndex: 10,
    },
    matchPercentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    matchText: {
        fontSize: 10,
        color: '#FFFFFF',
        marginTop: 2,
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
