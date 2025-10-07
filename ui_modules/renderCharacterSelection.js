let PhoneSim_State, PhoneSim_DataHandler, PhoneSim_Config;

export const RenderCharacterSelection = {
    init: function(state, dataHandler, config) {
        PhoneSim_State = state;
        PhoneSim_DataHandler = dataHandler;
        PhoneSim_Config = config;
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        // 添加角色按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('#add-character-btn')) {
                this.showAddCharacterDialog();
            }
            
            if (e.target.closest('#enable-cross-character-btn')) {
                this.enableCrossCharacterCommunication();
            }
        });

        // 角色选择
        document.addEventListener('click', (e) => {
            const characterItem = e.target.closest('.character-item');
            if (characterItem && !e.target.closest('.character-actions')) {
                const characterId = characterItem.dataset.characterId;
                this.selectCharacter(characterId);
            }
        });

        // 角色操作按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.character-edit-btn')) {
                const characterId = e.target.closest('.character-item').dataset.characterId;
                this.showEditCharacterDialog(characterId);
            }
            
            if (e.target.closest('.character-delete-btn')) {
                const characterId = e.target.closest('.character-item').dataset.characterId;
                this.showDeleteCharacterConfirm(characterId);
            }
        });

        // 对话框事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.character-dialog-close') || 
                (e.target.classList.contains('character-dialog') && !e.target.closest('.character-dialog-content'))) {
                this.hideCharacterDialog();
            }
            
            if (e.target.closest('#save-character-btn')) {
                this.saveCharacter();
            }
            
            if (e.target.closest('#cancel-character-btn')) {
                this.hideCharacterDialog();
            }
        });

        // 头像上传
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('character-avatar-input')) {
                this.handleAvatarUpload(e);
            }
        });
    },

    render: function() {
        const characterList = document.querySelector('#character-selection-view .character-list');
        if (!characterList) return;

        const characters = PhoneSim_State.characters;
        const currentCharacterId = PhoneSim_State.currentCharacterId;

        characterList.innerHTML = '';

        Object.values(characters).forEach(character => {
            const characterElement = this.createCharacterElement(character, character.id === currentCharacterId);
            characterList.appendChild(characterElement);
        });
    },

    createCharacterElement: function(character, isActive) {
        const div = document.createElement('div');
        div.className = `character-item ${isActive ? 'active' : ''}`;
        div.dataset.characterId = character.id;

        const avatarContent = character.avatar ? 
            `<img src="${character.avatar}" alt="${character.name}">` : 
            character.name.charAt(0).toUpperCase();

        const canDelete = character.id !== PhoneSim_Config.DEFAULT_CHARACTER_ID;

        div.innerHTML = `
            <div class="character-avatar">
                ${avatarContent}
            </div>
            <div class="character-name">${character.name}</div>
            <div class="character-actions">
                <button class="character-action-btn character-edit-btn" title="编辑角色">
                    <i class="fas fa-edit"></i>
                </button>
                ${canDelete ? `
                    <button class="character-action-btn character-delete-btn delete-btn" title="删除角色">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;

        return div;
    },

    selectCharacter: function(characterId) {
        if (PhoneSim_State.switchCharacter(characterId)) {
            // 重新渲染角色列表
            this.render();
            
            // 重新加载角色数据
            if (PhoneSim_DataHandler && PhoneSim_DataHandler.loadCharacterData) {
                PhoneSim_DataHandler.loadCharacterData(characterId);
            }
            
            // 显示成功消息
            this.showNotification(`已切换到角色: ${PhoneSim_State.getCurrentCharacter().name}`);
            
            // 延迟后自动进入主屏幕
            setTimeout(() => {
                this.goToHomeScreen();
            }, 1000);
        }
    },

    showAddCharacterDialog: function() {
        this.showCharacterDialog('添加角色', {
            id: '',
            name: '',
            avatar: '',
            description: ''
        });
    },

    showEditCharacterDialog: function(characterId) {
        const character = PhoneSim_State.characters[characterId];
        if (character) {
            this.showCharacterDialog('编辑角色', character);
        }
    },

    showCharacterDialog: function(title, character) {
        // 移除现有对话框
        this.hideCharacterDialog();

        const dialog = document.createElement('div');
        dialog.className = 'character-dialog';
        dialog.innerHTML = `
            <div class="character-dialog-content">
                <div class="character-dialog-header">
                    <div class="character-dialog-title">${title}</div>
                    <button class="character-dialog-close">&times;</button>
                </div>
                
                <div class="character-avatar-upload">
                    <div class="character-avatar-preview">
                        ${character.avatar ? `<img src="${character.avatar}" alt="头像">` : character.name.charAt(0).toUpperCase()}
                        <div class="character-avatar-overlay">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                    <input type="file" class="character-avatar-input" accept="image/*">
                </div>
                
                <div class="character-form-group">
                    <label class="character-form-label">角色名称</label>
                    <input type="text" class="character-form-input" id="character-name-input" 
                           value="${character.name}" placeholder="请输入角色名称" maxlength="20">
                </div>
                
                <div class="character-form-group">
                    <label class="character-form-label">角色描述</label>
                    <textarea class="character-form-input character-form-textarea" id="character-description-input" 
                              placeholder="请输入角色描述（可选）" maxlength="200">${character.description || ''}</textarea>
                </div>
                
                <div class="character-dialog-actions">
                    <button class="character-dialog-btn secondary" id="cancel-character-btn">取消</button>
                    <button class="character-dialog-btn primary" id="save-character-btn">保存</button>
                </div>
            </div>
        `;

        dialog.dataset.characterId = character.id;
        dialog.dataset.originalAvatar = character.avatar || '';
        
        document.body.appendChild(dialog);
        
        // 显示动画
        setTimeout(() => {
            dialog.classList.add('active');
        }, 10);

        // 聚焦到名称输入框
        setTimeout(() => {
            const nameInput = dialog.querySelector('#character-name-input');
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        }, 300);
    },

    hideCharacterDialog: function() {
        const dialog = document.querySelector('.character-dialog');
        if (dialog) {
            dialog.classList.remove('active');
            setTimeout(() => {
                dialog.remove();
            }, 300);
        }
    },

    handleAvatarUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择图片文件', 'error');
            return;
        }

        // 检查文件大小 (限制为2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('图片文件不能超过2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.querySelector('.character-avatar-preview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="头像预览">
                    <div class="character-avatar-overlay">
                        <i class="fas fa-camera"></i>
                    </div>
                `;
            }
        };
        reader.readAsDataURL(file);
    },

    saveCharacter: function() {
        const dialog = document.querySelector('.character-dialog');
        if (!dialog) return;

        const characterId = dialog.dataset.characterId;
        const nameInput = dialog.querySelector('#character-name-input');
        const descriptionInput = dialog.querySelector('#character-description-input');
        const avatarImg = dialog.querySelector('.character-avatar-preview img');

        const name = nameInput.value.trim();
        if (!name) {
            this.showNotification('请输入角色名称', 'error');
            nameInput.focus();
            return;
        }

        // 检查名称是否重复
        const existingCharacter = Object.values(PhoneSim_State.characters).find(
            char => char.name === name && char.id !== characterId
        );
        if (existingCharacter) {
            this.showNotification('角色名称已存在', 'error');
            nameInput.focus();
            return;
        }

        const characterData = {
            id: characterId,
            name: name,
            description: descriptionInput.value.trim(),
            avatar: avatarImg ? avatarImg.src : dialog.dataset.originalAvatar
        };

        if (characterId) {
            // 编辑现有角色
            PhoneSim_State.characters[characterId] = {
                ...PhoneSim_State.characters[characterId],
                ...characterData
            };
            PhoneSim_State.saveCharacters();
            this.showNotification('角色信息已更新');
        } else {
            // 添加新角色
            const newId = PhoneSim_State.addCharacter(characterData);
            
            // 为新角色创建独立的世界书
            if (PhoneSim_DataHandler && PhoneSim_DataHandler.createCharacterLorebook) {
                PhoneSim_DataHandler.createCharacterLorebook(newId);
            }
            
            this.showNotification('角色已添加');
        }

        this.hideCharacterDialog();
        this.render();
    },

    showDeleteCharacterConfirm: function(characterId) {
        const character = PhoneSim_State.characters[characterId];
        if (!character) return;

        if (characterId === PhoneSim_Config.DEFAULT_CHARACTER_ID) {
            this.showNotification('无法删除默认角色', 'error');
            return;
        }

        const confirmed = confirm(`确定要删除角色"${character.name}"吗？\n\n删除后该角色的所有数据将无法恢复。`);
        if (confirmed) {
            if (PhoneSim_State.removeCharacter(characterId)) {
                // 删除角色的世界书数据
                if (PhoneSim_DataHandler && PhoneSim_DataHandler.deleteCharacterLorebook) {
                    PhoneSim_DataHandler.deleteCharacterLorebook(characterId);
                }
                
                this.showNotification('角色已删除');
                this.render();
            }
        }
    },

    goToHomeScreen: function() {
        PhoneSim_State.currentView = 'HomeScreen';
        PhoneSim_State.isCharacterSelectionVisible = false;
        
        // 隐藏角色选择页面
        const characterView = document.getElementById('character-selection-view');
        const homeView = document.getElementById('homescreen-view');
        
        if (characterView) characterView.classList.remove('active');
        if (homeView) homeView.classList.add('active');
        
        PhoneSim_State.saveUiState();
    },

    showNotification: function(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `phone-sim-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4757' : '#2ed573'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(10px)';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },

    enableCrossCharacterCommunication: function() {
        // 检查是否有多个角色
        const characters = Object.values(PhoneSim_State.characters);
        if (characters.length < 2) {
            this.showNotification('需要至少2个角色才能启用角色间通信', 'error');
            return;
        }

        // 显示确认对话框
        const confirmed = confirm(`确定要启用角色间通信吗？\n\n这将会：\n1. 将所有角色互相添加为联系人\n2. 允许角色之间发送消息\n3. 每个角色都能看到其他角色的消息`);
        
        if (!confirmed) {
            return;
        }

        try {
            // 调用数据模块的启用角色间通信功能
            if (PhoneSim_DataHandler && PhoneSim_DataHandler.enableCrossCharacterCommunication) {
                PhoneSim_DataHandler.enableCrossCharacterCommunication();
                this.showNotification('角色间通信已启用！所有角色已互相添加为联系人');
            } else {
                this.showNotification('功能暂不可用，请稍后再试', 'error');
            }
        } catch (error) {
            console.error('启用角色间通信失败:', error);
            this.showNotification('启用失败，请稍后再试', 'error');
        }
    }
};