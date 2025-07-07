
import { TokenTree } from "./index";
import { filterTreeByTokenType } from "./index";
import { DefinedTokenType } from "./index";
import { NamingTarget } from "../core/types/naming_types";
import { generateIdentifier } from "../core/naming/identifier_gen";
import { DartRenderer } from "./dart/dart-renderer";
import { TokenRendererRegistry } from "../core/render/token_renderer";
import { renderTypographyToken } from "../content/dart/typography/token_renderer"
import { generateFile } from "../core/generator"


export function generateTypography(
    tree: TokenTree,
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const result: Array<{ name: string; path: string; content: string }> = [];

    const typographyTree = filterTreeByTokenType(tree, DefinedTokenType.Typography);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Typography, renderTypographyToken);
    const renderer = new DartRenderer(
        registry,
    );

    for (const root of typographyTree.roots) {
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
                path: `supernova/text_style`,
                content: `import 'package:flutter/material.dart'; \nimport 'package:ui_kit_litnet_audio/utils/sizes.dart'; \n\n${body.trim()} `,
            });
        }
    }
    return result;
}