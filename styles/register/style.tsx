import {Dimensions, StyleSheet} from 'react-native';

export const gStyle = StyleSheet.create({
    main: {
        flex: 1,
    },
    title: {
        fontSize: 18,
    },
});

export const headStyle = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo:{
        width: '60%',
        height: '60%',
        aspectRatio: 1,
    },
    buttonContainer: {
        marginTop: 20,
    },
    button: {
        backgroundColor: 'rgba(24, 11, 80, 0.5)', // тот самый #180B5066 💜
        paddingVertical: '5%',
        paddingHorizontal: '15%',
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF', // белый текст, НЕ прозрачный
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export const stylesRedirect = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1 },

    content: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between', // вместо center
        paddingTop: 120,                 // отступ сверху (заголовок)
        paddingBottom: 60,
        marginTop: 120,             // отступ снизу (кнопки)
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 18,
    },

    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#fff',
        opacity: 0.9,
        marginBottom: 18,
    },

    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 60,
    },

    or: {
        marginVertical: 14,
        color: '#fff',
        opacity: 0.9,
    },

    actionButton: {
        width: '92%',
        minHeight: 64,
        borderRadius: 28,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // важное: чтобы текст был по центру "плашки"
        gap: 14,

        // тень как на мокапе
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },

    actionButtonPrimary: {
        backgroundColor: 'rgba(62, 49, 132, 0.95)',
    },

    actionButtonSecondary: {
        backgroundColor: 'rgba(55, 45, 120, 0.88)',
    },

    iconCircle: {
        position: 'absolute',
        left: 16,
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.55)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },

    iconArrow: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginTop: -1,
    },

    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 18,
        paddingLeft: 18, // чуть компенсируем круг слева, чтобы центр выглядел как в дизайне
        paddingRight: 10,
    },

    pressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.95,
    },
});

export const stylesRegister = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },

    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(65, 49, 182, 0.1)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#4131B6',
        fontSize: 24,
        fontWeight: 'bold',
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#4131B6',
    },

    formContainer: {
        width: '100%',
    },

    inputGroup: {
        marginBottom: 15,
    },

    label: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },

    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000000',
        width: '100%',
    },

    inputError: {
        borderWidth: 1,
        borderColor: '#FF0000',
    },

    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },

    /* ===== Gender dropdown ===== */

    genderDropdownContainer: {
        position: 'relative',
        width: '100%',
        zIndex: 100,
    },

    genderDropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    genderDropdownButtonText: {
        fontSize: 16,
        color: '#000000',
    },

    genderDropdownPlaceholder: {
        color: '#999999',
    },

    genderDropdownArrow: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 8,
    },

    genderDropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginTop: 4,
        zIndex: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
        overflow: 'hidden',
    },

    genderOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    genderOptionSelected: {
        backgroundColor: '#4131B6',
    },

    genderOptionText: {
        fontSize: 16,
        color: '#000000',
    },

    genderOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    /* ===== Date button on form ===== */

    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8E4FF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        width: '100%',
    },

    dateButtonText: {
        fontSize: 16,
        color: '#4131B6',
        marginLeft: 12,
        flex: 1,
    },

    /* ===== Continue button ===== */

    continueButton: {
        backgroundColor: '#4131B6',
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        width: '100%',
    },

    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },

    /* =========================
       MODAL (как на 2-м скрине)
       ========================= */

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 28,
        position: 'relative',
    },

    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    chevronBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    chevron: {
        fontSize: 28,
        color: '#4131B6',
        fontWeight: '700',
    },

    centerHeader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalTitleSmall: {
        fontSize: 14,
        color: '#000000',
        opacity: 0.75,
        marginBottom: 6,
    },

    yearTapArea: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 10,
    },

    yearBig: {
        fontSize: 34,
        fontWeight: '800',
        color: '#4131B6',
        lineHeight: 40,
    },

    monthText: {
        fontSize: 14,
        color: '#4131B6',
        marginTop: 2,
    },

    calendarContainer: {
        marginBottom: 18,
    },

    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },

    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },

    calendarDayEmpty: {
        opacity: 0,
    },

    calendarDaySelected: {
        backgroundColor: '#4131B6',
        borderRadius: 20,
    },

    calendarDayText: {
        fontSize: 16,
        color: '#000000',
    },

    calendarDayTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    saveButton: {
        backgroundColor: '#4131B6',
        borderRadius: 28,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 6,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

    /* Dropdown years overlay */
    yearDropdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },

    yearDropdownCard: {
        width: 190,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },

    yearRow: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },

    yearRowSelected: {
        backgroundColor: '#4131B6',
    },

    yearRowText: {
        fontSize: 16,
        color: '#000000',
    },

    yearRowTextSelected: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
});

export const stylesVerification = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    background: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#4131B6',
        marginTop: 50
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(65, 49, 182, 0.1)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#4131B6',
        fontSize: 24,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666666',
        marginLeft: '10%',
        marginBottom: '2%',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000000',
        width: '80%',
        margin: 'auto',
    },
    resendButton: {
        backgroundColor: '#4131B6',
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        width: '80%',
        margin: 'auto',
    },
    resendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
})

export const stylesPassword = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    background: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#4131B6',
        marginTop: 50
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(65, 49, 182, 0.1)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#4131B6',
        fontSize: 24,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666666',
        marginLeft: '10%',
        marginBottom: '2%',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000000',
        width: '80%',
        margin: 'auto',
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 5,
        marginLeft: '10%',
    },
    continueButton: {
        backgroundColor: '#4131B6',
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '90%',
        width: '80%',
        margin: 'auto',
    },
    continueButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
})

export const stylesSkillsChoose = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    background: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
        position: 'relative',
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 20,
        position: 'absolute',
        right: 20,
        top: 60,
        zIndex: 10,
    },
    skipButtonText: {
        color: '#4131B6',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#4131B6',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    continueButtonArrow: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    continueButtonBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4131B6',
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginTop: 30,
        marginBottom: 20,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(65, 49, 182, 0.1)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#4131B6',
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        color: '#000000',
        fontSize: 27,
        fontWeight: 'bold',
        marginLeft: '7%',
        marginTop: '5%',
        marginBottom: 10,
    },
    description: {
        color: '#000000',
        fontSize: 14,
        marginLeft: '7%',
        marginBottom: 30,
        fontWeight: '300',
    },
    customSkillSection: {
        marginLeft: '7%',
        marginRight: '7%',
        marginBottom: 30,
    },
    customSkillTitle: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000000',
        paddingRight: 10,
    },
    searchIcon: {
        fontSize: 20,
        color: '#4131B6',
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: '7%',
        gap: 12,
    },
    skillButton: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'lightgrey',
        paddingVertical: 16,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 12,
    },
    skillButtonSelected: {
        backgroundColor: '#4131B6',
        borderColor: '#4131B6',
    },
    skillIconSelected: {
        color: '#FFFFFF',
    },
    skillText: {
        fontSize: 16,
        color: 'black',
        fontWeight: '500',
    },
    skillTextSelected: {
        color: '#FFFFFF',
    },
})

export const stylesExpectations = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    background: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
        position: 'relative',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 20,
        position: 'absolute',
        right: 20,
        top: 60,
        zIndex: 10,
    },
    continueButtonText: {
        color: '#4131B6',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    continueButtonArrow: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    continueButtonBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4131B6',
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginTop: 30,
        marginBottom: 30,
        marginHorizontal: '7%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 200,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(65, 49, 182, 0.1)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#4131B6',
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        color: '#000000',
        fontSize: 27,
        fontWeight: 'bold',
        marginLeft: '7%',
        marginTop: '5%',
        marginBottom: 10,
    },
    description: {
        color: '#000000',
        fontSize: 14,
        marginLeft: '7%',
        marginBottom: 30,
        fontWeight: '300',
    },
    section: {
        marginLeft: '7%',
        marginRight: '7%',
        marginBottom: 30,
        overflow: 'visible',
    },
    sectionTitle: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    formatsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderRadius: 30,
        padding: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: 'lightgrey',
    },
    formatButton: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'lightgrey',
        paddingVertical: 16,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 12,
    },
    formatButtonSelected: {
        backgroundColor: '#4131B6',
    },
    formatText: {
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
    },
    formatTextSelected: {
        color: '#FFFFFF',
        boxSizing: 'border-box',
    },
    salaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'lightgrey',
        padding: 12,
        gap: 10,
        overflow: 'visible',
    },
    salaryInputWrapper: {
        flex: 1,
    },
    periodWrapper: {
        flex: 1,
        overflow: 'visible',
    },
    periodContainer: {
        position: 'relative',
        zIndex: 1000,
        overflow: 'visible',
    },
    salaryLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputSalary: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000000',
    },
    periodButton: {
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    periodButtonText: {
        color: '#999999',
        fontSize: 16,
    },
    periodButtonTextSelected: {
        color: '#000000',
    },
    periodButtonArrow: {
        color: '#FFFFFF',
        fontSize: 12,
        marginLeft: 8,
    },
    periodDropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderTopWidth: 0,
        marginTop: 0,
        overflow: 'hidden',
        zIndex: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
        maxHeight: 200,
    },
    periodDropdownScroll: {
        maxHeight: 200,
    },
    periodOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    periodOptionLast: {
        borderBottomWidth: 0,
    },
    periodOptionSelected: {
        backgroundColor: '#4131B6',
    },
    periodOptionText: {
        fontSize: 16,
        color: '#000000',
    },
    periodOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    periodDropdownModal: {
        position: 'absolute',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderTopWidth: 0,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
})