import type { ITokenGroup, IToken } from "src/core/types/core-types"

export type TokenTree = {
    roots: TreeNode[];
};

export type TreeNode = {
    children: Map<string, TreeNode>;
    tokenGroup: ITokenGroup;
    tokens?: IToken[];
};