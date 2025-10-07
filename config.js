

export const PhoneSim_Config = {
    LOREBOOK_PREFIX: 'PhoneSim_Data_',
    WORLD_DB_NAME: '手机模拟器_聊天记录',
    WORLD_DIR_NAME: '手机模拟器_联系人目录',
    WORLD_AVATAR_DB_NAME: '手机模拟器_头像存储',
    WORLD_EMAIL_DB_NAME: '手机模拟器_邮件数据库',
    WORLD_CALL_LOG_DB_NAME: '手机模拟器_通话记录',
    WORLD_BROWSER_DATABASE: '手机模拟器_浏览器数据库',
    WORLD_FORUM_DATABASE: '手机模拟器_论坛数据库',
    WORLD_LIVECENTER_DATABASE: '手机模拟器_直播数据',
    PLAYER_ID: 'PLAYER_USER',
    PANEL_ID: 'phone-sim-panel-v10-0',
    TOGGLE_BUTTON_ID: 'phone-sim-toggle-btn-v10-0',
    COMMIT_BUTTON_ID: 'phone-sim-commit-btn-v10-0',
    STORAGE_KEY_UI: 'phone-sim-ui-state-v10-0',
    STORAGE_KEY_CUSTOMIZATION: 'phone-sim-customization-v10-0',
    
    // 多角色支持配置
    CHARACTER_SELECTION_VIEW_ID: 'character-selection-view',
    STORAGE_KEY_CHARACTERS: 'phone-sim-characters-v10-0',
    STORAGE_KEY_CURRENT_CHARACTER: 'phone-sim-current-character-v10-0',
    DEFAULT_CHARACTER_ID: 'default_user',
    CHARACTER_LOREBOOK_PREFIX: 'PhoneSim_Character_',
    WORLD_STATE_REGEX: /<WorldState>[\s\S]*?时间[:：]\s*(\d{4}[年\/-]\d{1,2}[月\/-]\d{1,2}[日]?\s*(\d{1,2}:\d{2}))/s,
    INITIAL_LOREBOOK_ENTRIES: [
        { name: '手机模拟器_聊天记录', content: '{}', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_联系人目录', content: '{}', enabled: true, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_头像存储', content: '{}', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_邮件数据库', content: '[]', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_通话记录', content: '[]', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_浏览器数据库', content: '{}', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_论坛数据库', content: '{}', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
        { name: '手机模拟器_直播数据', content: '{}', enabled: false, comment: 'Managed by Phone Simulator Plugin. Do not edit manually.' },
    ],
    
    // 角色数据库名称生成函数
    getCharacterDatabaseName: function(characterId, databaseType) {
        const prefix = this.CHARACTER_LOREBOOK_PREFIX + characterId + '_';
        switch(databaseType) {
            case 'chat': return prefix + '聊天记录';
            case 'contacts': return prefix + '联系人目录';
            case 'avatars': return prefix + '头像存储';
            case 'emails': return prefix + '邮件数据库';
            case 'calls': return prefix + '通话记录';
            case 'browser': return prefix + '浏览器数据库';
            case 'forum': return prefix + '论坛数据库';
            case 'livecenter': return prefix + '直播数据';
            default: return prefix + databaseType;
        }
    },
    
    // 为角色生成初始世界书条目
    getInitialCharacterEntries: function(characterId) {
        const prefix = this.CHARACTER_LOREBOOK_PREFIX + characterId + '_';
        return [
            { name: prefix + '聊天记录', content: '{}', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '联系人目录', content: '{}', enabled: true, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '头像存储', content: '{}', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '邮件数据库', content: '[]', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '通话记录', content: '[]', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '浏览器数据库', content: '{}', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '论坛数据库', content: '{}', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
            { name: prefix + '直播数据', content: '{}', enabled: false, comment: `Managed by Phone Simulator Plugin for character ${characterId}. Do not edit manually.` },
        ];
    }
};