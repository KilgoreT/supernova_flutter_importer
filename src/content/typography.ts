
import {
    TokenTree,
    filterTreeByTokenType,
    TokenRendererRegistry,
    DefinedTokenType,
    NamingTarget,
    generateIdentifier,
    generateFileContent,
} from "src/content/index";


import { DartRenderer } from "src/generators/dart/renderer";
import { renderTypographyToken } from "src/generators/dart/tokens/typography_renderer"
import { exportConfiguration } from "src/index";


export function generateTypography(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const result: Array<{ name: string; path: string; content: string }> = [];
    const typographyPath = exportConfiguration.typographyPath;
    const typographyTree = filterTreeByTokenType(tree, DefinedTokenType.Typography);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Typography, renderTypographyToken);
    const renderer = new DartRenderer(
        registry,
    );

    for (const root of typographyTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateFileContent(
                startNode,
                renderer,
                keywords,
                customIdentifiers,
                true,
            );
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
                keywords,
                customIdentifiers,
            );
            result.push({
                name: fileName,
                path: typographyPath,
                content: `import 'package:flutter/material.dart'; \nimport 'package:ui_kit_litnet_audio/utils/sizes.dart'; \n\n${body.trim()} `,
            });
        }
    }
    return result;
}