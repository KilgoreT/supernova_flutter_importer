import {
    TokenTree,
    filterTreeByTokenType,
    DefinedTokenType,
    NamingTarget,
    generateIdentifier,
    TokenRendererRegistry,
    generateFileContent,

} from "src/content/index";

import { DartRenderer } from "src/generators/dart/renderer";
import { renderColorToken } from "src/generators/dart/tokens/color_renderer"
import { exportConfiguration } from "..";

export function generateColors(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const colorPath = exportConfiguration.colorPath;

    const result: Array<{ name: string; path: string; content: string }> = [];

    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Color, renderColorToken);
    const renderer = new DartRenderer(
        registry,
    );

    for (const root of colorTree.roots) {
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
                path: colorPath,
                content: `import 'package:flutter/material.dart'; \nimport 'package:ui_kit_litnet_audio/utils/sizes.dart'; \n\n${body.trim()} `,
            });
        }
    }
    return result;
}