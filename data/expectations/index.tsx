// Формат работы — где сотрудник физически находится / в каком режиме работает.
// id'ы соответствуют тому, что ожидает бэкенд в поле `workFormats`.
export const allWorkFormation : {id: string, name: string}[] = [
    {id: 'standart', name: 'Стандартный'},
    {id: 'online', name: 'Удалённый'},
    {id: 'hybrid', name: 'Гибридный'},
]

// Тип занятости — структура трудоустройства.
// id'ы соответствуют тому, что ожидает бэкенд в поле `employmentTypes`.
export const allEmploymentTypes : {id: string, name: string}[] = [
    {id: 'full', name: 'Полная'},
    {id: 'projectinformation', name: 'Проектная'},
    {id: 'partial', name: 'Частичная (подработка)'},
    {id: 'intership', name: 'Стажировка'},
]

export const allExperience : {id: string, name: string}[] = [
    {id: 'junior', name: 'Начинающий (стажер, junior)'},
    {id: 'middle', name: 'Опытный (middle,уверенный)'},
    {id: 'senior', name: 'Профи (senior,ведущий)'},
    {id: 'leader', name: 'Лидер (lead,директор)'},
]
