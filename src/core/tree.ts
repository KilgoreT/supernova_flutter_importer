import { TokenGroup, Token } from "@supernovaio/sdk-exporters"


export type Tree = {
    roots: TreeNode[];
};

export type TreeNode = {
    children: Map<string, TreeNode>;
    tokenGroup: TokenGroup;
    tokens?: Token[];
};

export function buildTokenGroupTree(
    groups: TokenGroup[],
    tokens: Token[]
): Tree {
    const groupMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Шаг 1: Создаем TreeNode для каждой группы
    for (const group of groups) {
        groupMap.set(group.id, {
            tokenGroup: group,
            children: new Map(),
            tokens: [],
        });
    }

    // Шаг 2: Связываем группы в иерархию
    for (const groupNode of groupMap.values()) {
        const parentId = groupNode.tokenGroup.parentGroupId;
        if (parentId && groupMap.has(parentId)) {
            groupMap.get(parentId)!.children.set(
                groupNode.tokenGroup.name,
                groupNode
            );
        } else {
            roots.push(groupNode);
        }
    }

    // Шаг 3: Раскладываем токены по группам
    for (const token of tokens) {
        const groupNode = groupMap.get(token.parentGroupId);
        if (groupNode) {
            groupNode.tokens!.push(token);
        }
    }

    return { roots };
}
