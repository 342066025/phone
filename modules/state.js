import { PhoneSim_Config } from '../config.js';

let parentWindow;

export const PhoneSim_State = {
    isNavigating: false, // Prevents concurrent navigation actions
    isPanelVisible: false,
    panelPos: null,
    contacts: {},
    emails: [],
    moments: [],
    callLogs: [],
    forumData: {},
    liveCenterData: {},
    activeContactId: null,
    activeEmailId: null,
    activeProfileId: null,
    activeForumBoardId: null,
    activeForumPostId: null,
    activeLiveBoardId: null,
    activeLiveStreamId: null,
    activeLiveStreamData: null,
    activeReplyUid: null,
    worldDate: new Date(),
    worldTime: '12:00',
    customization: { isMuted: false, playerNickname: '我', enabled: true },
    stagedPlayerMessages: [],
    stagedPlayerActions: [],
    pendingFriendRequests: [],
    lastTotalUnread: 0,
    isVoiceCallActive: false,
    activeCallData: null,
    isPhoneCallActive: false,
    activePhoneCallData: null,
    isCallRecording: false,
    incomingCallData: null,
    currentView: 'HomeScreen',
    activeSubviews: {},
    browserHistory: [], // This is now officially the SESSION history for back/forward
    persistentBrowserHistory: [], // This is the full history log for the Library view
    browserData: {},
    browserDirectory: {},
    browserHistoryIndex: -1,
    isBrowserLoading: false,
    pendingBrowserAction: null,
    browserBookmarks: [],
    pendingAnimations: {},
    
    // 多角色状态管理
    characters: {},
    currentCharacterId: null,
    isCharacterSelectionVisible: false,

    init: function(win) {
        parentWindow = win;
        this.loadCharacters();
        this.loadCurrentCharacter();
    },

    loadCustomization: function() {
        try {
            const saved = JSON.parse(parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_CUSTOMIZATION) || '{}');
            const defaultCustomization = { isMuted: false, playerNickname: '我', enabled: true };
            this.customization = { ...defaultCustomization, ...this.customization, ...saved };
        } catch (e) {
            console.error('[Phone Sim] Failed to load customization state from localStorage:', e);
            this.customization = { isMuted: false, playerNickname: '我', enabled: true };
        }
    },

    saveCustomization: function() {
        try {
            parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_CUSTOMIZATION, JSON.stringify(this.customization));
        } catch (er) {
            console.error('[Phone Sim] Failed to save customization to localStorage:', er);
        }
    },

    loadUiState: function() {
        try {
            const s = JSON.parse(parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_UI) || '{}');
            // Selectively assign properties to avoid overwriting initialized objects
            const propertiesToLoad = [
                'isPanelVisible', 'panelPos', 'currentView', 'activeContactId', 
                'activeEmailId', 'activeProfileId', 'activeForumBoardId', 
                'activeForumPostId', 'activeLiveBoardId', 'activeLiveStreamId', 
                'activeSubviews'
            ];
            for (const prop of propertiesToLoad) {
                if (s[prop] !== undefined) {
                    this[prop] = s[prop];
                }
            }
        } catch (e) {
            console.error('[Phone Sim] Failed to load UI state from localStorage:', e);
        }
    },
    saveUiState: function() {
        try {
            const stateToSave = { 
                isPanelVisible: this.isPanelVisible, 
                panelPos: this.panelPos,
                currentView: this.currentView,
                activeContactId: this.activeContactId,
                activeEmailId: this.activeEmailId,
                activeProfileId: this.activeProfileId,
                activeForumBoardId: this.activeForumBoardId,
                activeForumPostId: this.activeForumPostId,
                activeLiveBoardId: this.activeLiveBoardId,
                activeLiveStreamId: this.activeLiveStreamId,
                activeSubviews: this.activeSubviews
            };
            parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_UI, JSON.stringify(stateToSave));
        } catch (e) {
            console.error('[Phone Sim] Failed to save UI state to localStorage:', e);
        }
    },

    // 角色管理方法
    loadCharacters: function() {
        try {
            const saved = JSON.parse(parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_CHARACTERS) || '{}');
            this.characters = saved;
            
            // 确保有默认角色
            if (!this.characters[PhoneSim_Config.DEFAULT_CHARACTER_ID]) {
                this.characters[PhoneSim_Config.DEFAULT_CHARACTER_ID] = {
                    id: PhoneSim_Config.DEFAULT_CHARACTER_ID,
                    name: '默认用户',
                    avatar: '',
                    createdAt: new Date().toISOString()
                };
                this.saveCharacters();
            }
        } catch (e) {
            console.error('[Phone Sim] Failed to load characters from localStorage:', e);
            this.characters = {};
            this.characters[PhoneSim_Config.DEFAULT_CHARACTER_ID] = {
                id: PhoneSim_Config.DEFAULT_CHARACTER_ID,
                name: '默认用户',
                avatar: '',
                createdAt: new Date().toISOString()
            };
        }
    },

    saveCharacters: function() {
        try {
            parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_CHARACTERS, JSON.stringify(this.characters));
        } catch (e) {
            console.error('[Phone Sim] Failed to save characters to localStorage:', e);
        }
    },

    loadCurrentCharacter: function() {
        try {
            const saved = parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_CURRENT_CHARACTER);
            this.currentCharacterId = saved || PhoneSim_Config.DEFAULT_CHARACTER_ID;
            
            // 确保当前角色存在
            if (!this.characters[this.currentCharacterId]) {
                this.currentCharacterId = PhoneSim_Config.DEFAULT_CHARACTER_ID;
                this.saveCurrentCharacter();
            }
        } catch (e) {
            console.error('[Phone Sim] Failed to load current character from localStorage:', e);
            this.currentCharacterId = PhoneSim_Config.DEFAULT_CHARACTER_ID;
        }
    },

    saveCurrentCharacter: function() {
        try {
            parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_CURRENT_CHARACTER, this.currentCharacterId);
        } catch (e) {
            console.error('[Phone Sim] Failed to save current character to localStorage:', e);
        }
    },

    addCharacter: function(characterData) {
        const id = characterData.id || 'char_' + Date.now();
        this.characters[id] = {
            id: id,
            name: characterData.name || '新角色',
            avatar: characterData.avatar || '',
            createdAt: new Date().toISOString(),
            ...characterData
        };
        this.saveCharacters();
        return id;
    },

    removeCharacter: function(characterId) {
        if (characterId === PhoneSim_Config.DEFAULT_CHARACTER_ID) {
            console.warn('[Phone Sim] Cannot remove default character');
            return false;
        }
        
        if (this.characters[characterId]) {
            delete this.characters[characterId];
            this.saveCharacters();
            
            // 如果删除的是当前角色，切换到默认角色
            if (this.currentCharacterId === characterId) {
                this.switchCharacter(PhoneSim_Config.DEFAULT_CHARACTER_ID);
            }
            return true;
        }
        return false;
    },

    switchCharacter: function(characterId) {
        if (this.characters[characterId]) {
            this.currentCharacterId = characterId;
            this.saveCurrentCharacter();
            
            // 清空当前状态，准备加载新角色的数据
            this.resetCharacterSpecificState();
            return true;
        }
        return false;
    },

    getCurrentCharacter: function() {
        return this.characters[this.currentCharacterId] || this.characters[PhoneSim_Config.DEFAULT_CHARACTER_ID];
    },

    resetCharacterSpecificState: function() {
        // 重置角色相关的状态
        this.contacts = {};
        this.emails = [];
        this.moments = [];
        this.callLogs = [];
        this.forumData = {};
        this.liveCenterData = {};
        this.activeContactId = null;
        this.activeEmailId = null;
        this.activeProfileId = null;
        this.activeForumBoardId = null;
        this.activeForumPostId = null;
        this.activeLiveBoardId = null;
        this.activeLiveStreamId = null;
        this.activeLiveStreamData = null;
        this.activeReplyUid = null;
        this.stagedPlayerMessages = [];
        this.stagedPlayerActions = [];
        this.pendingFriendRequests = [];
        this.lastTotalUnread = 0;
        this.browserHistory = [];
        this.persistentBrowserHistory = [];
        this.browserData = {};
        this.browserDirectory = {};
        this.browserHistoryIndex = -1;
        this.browserBookmarks = [];
        
        // 重置到主屏幕
        this.currentView = 'HomeScreen';
        this.activeSubviews = {};
    }
};
