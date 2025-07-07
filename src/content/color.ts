import { TokenTree } from "src/content/index";
import { filterTreeByTokenType } from "src/content/index";
import { DefinedTokenType } from "src/content/index";
import { NamingTarget } from "src/core/types/naming_types";
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { DartRenderer } from "src/content/dart/dart-renderer";
import { TokenRendererRegistry } from "src/core/render/token_renderer";
import { renderColorToken } from "src/content/dart/color/color_token_renderer"
import { generateFile } from "src/core/generator"

export function generateColors(
    tree: TokenTree,
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const result: Array<{ name: string; path: string; content: string }> = [];

    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Color, renderColorToken);
    const renderer = new DartRenderer(
        registry,
    );

    for (const root of colorTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateFile(
                startNode,
                renderer,
                true,
            );
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
            );
            result.push({
                name: fileName,
                path: `supernova/color`,
                content: `import 'package:flutter/material.dart'; \nimport 'package:ui_kit_litnet_audio/utils/sizes.dart'; \n\n${body.trim()} `,
            });
        }
    }
    return result;
}