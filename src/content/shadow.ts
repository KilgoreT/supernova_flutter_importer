
import { TokenTree } from "src/content/index";
import { filterTreeByTokenType } from "src/content/index";
import { DefinedTokenType } from "src/content/index";
import { NamingTarget } from "src/core/types/naming_types";
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { DartRenderer } from "src/content/dart/dart-renderer";
import { TokenRendererRegistry } from "src/core/render/token_renderer";
import { generateFile } from "src/core/generator"
import { renderShadowToken } from "./dart/shadow/shadow_token_renderer";
import { exportConfiguration } from "..";


export function generateShadow(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {

    const result: Array<{ name: string; path: string; content: string }> = [];
    const shadowPath = exportConfiguration.shadowPath;
    const shadowTree = filterTreeByTokenType(tree, DefinedTokenType.Shadow);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Shadow, renderShadowToken);
    const renderer = new DartRenderer(
        registry,
    );

    for (const root of shadowTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateFile(
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
                path: shadowPath,
                content: `import 'package:flutter/material.dart'; \nimport 'package:ui_kit_litnet_audio/utils/sizes.dart'; \n\n${body.trim()} `,
            });
        }
    }
    return result;
}