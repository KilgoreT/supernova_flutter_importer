import type { ITokenGroup, IToken } from "src/core/entity/core"

export type TokenTree = {
    roots: TreeNode[];
};

export type TreeNode = {
    children: Map<string, TreeNode>;
    tokenGroup: ITokenGroup;
    tokens?: IToken[];
};