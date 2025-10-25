class ConfigLoader {
    static async loadCharacters(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`无法加载角色配置文件: ${path} (状态码: ${response.status})`);
            }
            const data = await response.json();
            this.validateCharacterData(data);
            return data;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`角色配置文件格式错误: ${path} - JSON解析失败`);
            }
            throw error;
        }
    }

    static async loadBackgrounds(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`无法加载背景配置文件: ${path} (状态码: ${response.status})`);
            }
            const data = await response.json();
            this.validateBackgroundData(data);
            return data;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`背景配置文件格式错误: ${path} - JSON解析失败`);
            }
            throw error;
        }
    }

    static validateCharacterData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('角色配置数据必须是一个对象');
        }

        for (const [name, char] of Object.entries(data)) {
            // 检查必需字段
            if (!char.url) {
                throw new Error(`角色 ${name} 缺少必需字段: url`);
            }
            if (typeof char.point !== 'number') {
                throw new Error(`角色 ${name} 缺少必需字段: point 或类型不正确`);
            }
            if (!Array.isArray(char.status)) {
                throw new Error(`角色 ${name} 缺少必需字段: status 或类型不正确`);
            }

            // 检查状态类型
            const normalStates = char.status.filter(s => s.type === 'normal');
            const attackedStates = char.status.filter(s => s.type === 'attacked');
            const knockedStates = char.status.filter(s => s.type === 'knocked');

            if (normalStates.length !== 1) {
                throw new Error(`角色 ${name} 必须有且仅有一个 normal 状态 (当前: ${normalStates.length})`);
            }
            if (attackedStates.length !== 1) {
                throw new Error(`角色 ${name} 必须有且仅有一个 attacked 状态 (当前: ${attackedStates.length})`);
            }
            if (knockedStates.length !== 1) {
                throw new Error(`角色 ${name} 必须有且仅有一个 knocked 状态 (当前: ${knockedStates.length})`);
            }
        }
    }

    static validateBackgroundData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('背景配置数据必须是一个对象');
        }

        for (const [name, background] of Object.entries(data)) {
            if (!background.url) {
                throw new Error(`背景 ${name} 缺少必需字段: url`);
            }
        }
    }
}

export default ConfigLoader;
