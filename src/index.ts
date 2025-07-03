import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, ColorToken } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import { colorTokenToCSS } from "./content/token"
import { FileHelper } from "@supernovaio/export-helpers"
import { generateColors } from './content/color';



/**
 * Export entrypoint.
 * When running `export` through extensions or pipelines, this function will be called.
 * Context contains information about the design system and version that is currently being exported.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch data from design system that is currently being exported (context)
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch the necessary data
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // const flatGroups: TokenGroup[] = tokenGroups.map((g: any) => ({
  //   id: g.id,
  //   name: g.name,
  //   path: g.path,
  //   parentGroupId: g.parentGroupId,
  // }));

  // const tree = buildGroupTree(flatGroups);
  // console.log(JSON.stringify(tree, null, 2));


  // tokenGroups.forEach((tokenGroup, index) => {
  //   console.log(`Token Group: ${index} | ${tokenGroup}`);

  //   console.log(`   id: ${tokenGroup.id}`);
  //   console.log(`   idInVersion: ${tokenGroup.idInVersion}`);
  //   console.log(`   brandId: ${tokenGroup.brandId}`);
  //   console.log(`   designSystemVersionId: ${tokenGroup.designSystemVersionId}`);
  //   console.log(`   name: ${tokenGroup.name}`);
  //   console.log(`   description: ${tokenGroup.description}`);
  //   console.log(`   path: ${tokenGroup.path ? tokenGroup.path.join(" > ") : "N/A"}`);
  //   console.log(`   subgroupIds: ${tokenGroup.subgroupIds.join(", ")}`);
  //   console.log(`   type: ${tokenGroup.tokenType}`);
  //   console.log(`   isRoot: ${tokenGroup.isRoot}`);
  //   console.log(`   childrenIds: ${tokenGroup.childrenIds.join(", ")}`);
  //   console.log(`   tokenIds: ${tokenGroup.tokenIds.join(", ")}`);
  //   console.log(`   parentGroupId: ${tokenGroup.parentGroupId}`);
  //   console.log(`   sortOrder: ${tokenGroup.sortOrder}`);
  //   console.log("--------------------------------------------------");
  // });

  // let types = [...new Set(tokens.map(token => token.tokenType))];

  // console.log(`Unique types: ${types}`);

  // tokens.forEach((token, index) => {

  //   console.log(`Token: ${index} | ${token}`);
  //   // console.log(`   id: ${token.id}`);
  //   console.log(`   name: ${token.name}`);
  //   console.log(`   type: ${token.tokenType}`);
  //   // console.log(`   brandId: ${token.brandId}`);
  //   console.log(`   groupId: ${token.parentGroupId}`);
  //   console.log(`   path: ${token.tokenPath ? token.tokenPath.join(" > ") : "N/A"}`);
  //   console.log(`   properties: ${token.properties.map((p) => p.name).join(", ")}`);
  //   // console.log(`   createdAt: ${token.createdAt}`);
  //   // console.log(`   updatedAt: ${token.updatedAt}`);
  //   console.log("--------------------------------------------------");

  // });
  // console.log(`Size of tokens: ${tokens.length}`);

  // Filter by brand, if specified by the VSCode extension or pipeline configuration
  // if (context.brandId) {
  //   const brands = await sdk.brands.getBrands(remoteVersionIdentifier)
  //   const brand = brands.find((brand) => brand.id === context.brandId || brand.idInVersion === context.brandId)
  //   if (!brand) {
  //     throw new Error(`Unable to find brand ${context.brandId}.`)
  //   }

  //   tokens = tokens.filter((token) => token.brandId === brand.id)
  //   tokenGroups = tokenGroups.filter((tokenGroup) => tokenGroup.brandId === brand.id)
  // }

  // Apply themes, if specified
  // if (context.themeIds && context.themeIds.length > 0) {
  //   const themes = await sdk.tokens.getTokenThemes(remoteVersionIdentifier)

  //   const themesToApply = context.themeIds.map((themeId) => {
  //     const theme = themes.find((theme) => theme.id === themeId || theme.idInVersion === themeId)
  //     if (!theme) {
  //       throw new Error(`Unable to find theme ${themeId}.`)
  //     }
  //     return theme
  //   })

  //   tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
  // }

  // Convert all color tokens to CSS variables
  // const mappedTokens = new Map(tokens.map((token) => [token.id, token]))
  // const cssVariables = tokens
  //   .filter((t) => t.tokenType === TokenType.color)
  //   .map((token) => colorTokenToCSS(token as ColorToken, mappedTokens, tokenGroups))
  //   .join("\n")

  // Create CSS file content
  // let content = `:root {\n${cssVariables}\n}`



  // const content1 = generateColors(tokenGroups, tokens);
  // let content = `\n${content1}`
  // if (exportConfiguration.generateDisclaimer) {
  //   // Add disclaimer to every file if enabled
  //   content = `/* This file was generated by Supernova, don't change by hand */\n${content}`
  // }

  // // Create output file and return it
  // return [
  //   FileHelper.createTextFile({
  //     relativePath: "./",
  //     fileName: "colors.dart",
  //     content: content,
  //   }),
  // ]

  const colorGroups = tokenGroups.filter(g => g.tokenType === TokenType.color);
  const colorTokens = tokens.filter((t): t is ColorToken => t.tokenType === TokenType.color);

  const files = generateColors(colorGroups, colorTokens);

  const wrappedFiles = files.map(file => {
    let content = `\n${file.content}`;

    if (exportConfiguration.generateDisclaimer) {
      content = `/* This file was generated by Supernova, don't change by hand */\n${content}`;
    }

    return FileHelper.createTextFile({
      relativePath: "./",
      fileName: `${file.name}.dart`,
      content,
    });
  });

  return wrappedFiles;
})

/** Exporter configuration. Adheres to the `ExporterConfiguration` interface and its content comes from the resolved default configuration + user overrides of various configuration keys */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()
