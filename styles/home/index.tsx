import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    pageTitle: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '400',
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterIcon: {
        width: 20,
        height: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    filterLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#4131B6',
        borderRadius: 1,
        marginBottom: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999999',
    },
    jobCard: {
        width: '80%',
        aspectRatio: 0.6,
        backgroundColor: '#FF3B30',
        borderRadius: 60,
        elevation: 5,
        padding: 24,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        shadowColor: 'grey', // цвет тени из box-shadow
        shadowOffset: { width: -10, height: 10 }, // смещение X и Y
        shadowOpacity: 0.6,                         // прозрачность уже учтена в rgba
        shadowRadius: 1,

    },

    matchBadge: {
        position: 'absolute',
        top: 16,                 // отступ сверху карточки
        left: '60%',             // центр по горизонтали
        transform: [{ translateX: -50 }], // смещаем на половину ширины бейджа
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4131B6',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    matchCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    matchPercent: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    matchPercentText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    matchText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
    logo: {
        width: 120,
        height: 120,
        marginTop: 60,
        marginBottom: 20,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    logoPlaceholderText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    jobInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    jobInfoText: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        gap: 20,
    },

    actionButtonSmall: {
        width: 60,
        height: 60,
        borderRadius: 30,      // круг
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    actionButtonLarge: {
        width: 80,             // больше, чем маленькие
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4131B6', // фиолетовый
        shadowColor: '#4131B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },

    likeButton: {
        borderWidth: 0,
    },

    rejectButton: {
        borderWidth: 0,
    },

    chatButton: {
        borderWidth: 0,
    },

    rejectIcon: {
        fontSize: 24,
        color: '#FF3B30',
        fontWeight: 'bold',
    },

    likeIcon: {
        fontSize: 28,
        color: '#FFFFFF',
    },

    chatIcon: {
        fontSize: 20,
        color: '#4131B6', // можно цвет совпадающий с лайком
        fontWeight: 'bold',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF', // белый фон
    },

    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    navIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

// Активная иконка
    navIconActive: {
        backgroundColor: '#4131B6', // фиолетовый
        borderRadius: 6,
    },

// Индикатор под активной иконкой
    navIndicator: {
        position: 'absolute',
        bottom: -4,
        width: 30,
        height: 3,
        backgroundColor: '#4131B6',
        borderRadius: 2,
    },

// Маленькая точка для уведомления
    navDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4131B6',
    },

// Иконки
    heartIcon: {
        fontSize: 20,
        color: '#999999',
    },
    profileIcon: {
        fontSize: 20,
        color: '#999999',
    },
    moreIcon: {
        fontSize: 20,
        color: '#999999',
    },
    activeIconText: {
        color: '#FFFFFF',
    }
});