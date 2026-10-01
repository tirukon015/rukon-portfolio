import type { Block, BlogPost, PostCategory, PostSection } from "./types";

export type {
  Block,
  BlogPost,
  CalloutBlock,
  CodeBlock,
  FlowBlock,
  ImageBlock,
  ListBlock,
  PostCategory,
  PostContentType,
  PostSection,
  RelatedLink,
  SearchIntent,
  TableBlock,
} from "./types";

/*
 * One file per article, under ./articles. Add a new article by creating a
 * file there and importing it below; order here does not matter, because
 * every listing sorts by date.
 */
import { post as productionManagementSystem } from "./articles/what-is-a-production-management-system";
import { post as manualTrackingProblems } from "./articles/common-problems-manual-production-tracking";
import { post as adminPanels } from "./articles/how-admin-panels-help-manage-operational-data";
import { post as manualToDigital } from "./articles/from-manual-workflow-to-digital-workflow";
import { post as physicalProcess } from "./articles/why-developers-should-understand-the-physical-process";
import { post as maintenance } from "./articles/why-system-maintenance-matters-after-deployment";
import { post as figmaFirst } from "./articles/designing-a-website-in-figma-before-development";
import { post as figmaToProduction } from "./articles/from-figma-design-to-production-website";
import { post as figmaComponents } from "./articles/translating-figma-components-into-reusable-code";
import { post as responsiveDesign } from "./articles/designing-for-desktop-and-mobile-before-development";
import { post as itSystemsRole } from "./articles/what-an-it-systems-role-actually-involves";
import { post as repetitiveWork } from "./articles/replacing-repetitive-manual-work-with-software";
import { post as internalUx } from "./articles/why-internal-software-needs-good-ux";
import { post as reporting } from "./articles/reporting-from-operational-data";
import { post as prototypeRebuild } from "./articles/rebuilding-a-design-prototype-as-a-production-website";
import { post as staticVerification } from "./articles/verifying-a-static-site-you-built-by-hand";
import { post as imagePayload } from "./articles/cutting-a-page-image-payload-from-12mb-to-under-3mb";
import { post as llmGroundedness } from "./articles/making-an-llm-admit-the-paper-does-not-say";
import { post as providerFallback } from "./articles/when-not-to-fall-back-to-another-ai-provider";
import { post as rlsInert } from "./articles/every-policy-was-correct-and-every-policy-was-inert";
import { post as githubHeatmap } from "./articles/live-github-contribution-heatmap-in-nextjs";
import { post as cvGrant } from "./articles/gating-a-cv-download-behind-a-server-signed-grant";
import { post as storageBackends } from "./articles/one-storage-interface-three-backends";
import { post as stagedCsv } from "./articles/staged-csv-import-for-operational-data";
import { post as businessDay } from "./articles/the-business-day-is-not-the-server-day";
import { post as webBluetooth } from "./articles/printing-labels-from-the-browser-over-web-bluetooth";
import { post as visionObserves } from "./articles/a-vision-model-that-only-observes";
import { post as cyberjayaEnvironment } from "./articles/building-software-in-cyberjaya-the-development-environment";
import { post as addingLabelPrintingToANextjsAppThroughARelayPagePost } from "./articles/adding-label-printing-to-a-nextjs-app-through-a-relay-page";
import { post as analyticsRetentionRollupsWithPgCronPost } from "./articles/analytics-retention-rollups-with-pg-cron";
import { post as appGroupSwiftdataStoreWasNeverTheOneInUsePost } from "./articles/app-group-swiftdata-store-was-never-the-one-in-use";
import { post as appendOnlyCloudBackupSupabaseStorageRlsPost } from "./articles/append-only-cloud-backup-supabase-storage-rls";
import { post as appleFoundationModelsStructuredReceiptExtractionPost } from "./articles/apple-foundation-models-structured-receipt-extraction";
import { post as auditLogWithBeforeSnapshotsForDestructiveActionsPost } from "./articles/audit-log-with-before-snapshots-for-destructive-actions";
import { post as barcodeScannerWebAppScanPasteAndBeepPost } from "./articles/barcode-scanner-web-app-scan-paste-and-beep";
import { post as benchmarkRegressionGateMediansNoiseFloorPost } from "./articles/benchmark-regression-gate-medians-noise-floor";
import { post as benchmarkingOllamaVisionModelsTheCachedImageTrapPost } from "./articles/benchmarking-ollama-vision-models-the-cached-image-trap";
import { post as blankIsNotZeroProductionReportInputsPost } from "./articles/blank-is-not-zero-production-report-inputs";
import { post as cachingLlmResultsByContentHashWithoutLeakingUploadersPost } from "./articles/caching-llm-results-by-content-hash-without-leaking-uploaders";
import { post as callingPostgrestFromPythonWhatMocksMissPost } from "./articles/calling-postgrest-from-python-what-mocks-miss";
import { post as canonicalUrlsApexWww308SitemapRedirectsNextjsPost } from "./articles/canonical-urls-apex-www-308-sitemap-redirects-nextjs";
import { post as cappingImageSizeForAVisionModelInsideA60SecondLimitPost } from "./articles/capping-image-size-for-a-vision-model-inside-a-60-second-limit";
import { post as choosingAnEmbeddingModelUnderPgvectors2000DimensionLimitPost } from "./articles/choosing-an-embedding-model-under-pgvectors-2000-dimension-limit";
import { post as chromeBackgroundTabTimerThrottlingWebWorkerPost } from "./articles/chrome-background-tab-timer-throttling-web-worker";
import { post as comparisonBaselinesForAnOperationsDashboardPost } from "./articles/comparison-baselines-for-an-operations-dashboard";
import { post as contactFormSpamProtectionWithoutCaptchaPost } from "./articles/contact-form-spam-protection-without-captcha";
import { post as continuousLabelPrintingPageCounterAndUncertainJobsPost } from "./articles/continuous-label-printing-page-counter-and-uncertain-jobs";
import { post as contributingFixesToAWebAppYouDidNotBuildPost } from "./articles/contributing-fixes-to-a-web-app-you-did-not-build";
import { post as cookielessFirstPartyAnalyticsWithADailySaltedIpHashPost } from "./articles/cookieless-first-party-analytics-with-a-daily-salted-ip-hash";
import { post as countingSharedPackagingConsumptionAcrossDaysPost } from "./articles/counting-shared-packaging-consumption-across-days";
import { post as crossAppPrintingBroadcastchannelWebLocksPost } from "./articles/cross-app-printing-broadcastchannel-web-locks";
import { post as csvFormulaInjectionInExportsPost } from "./articles/csv-formula-injection-in-exports";
import { post as dataPreservationCheckBeforeProductionReleasePost } from "./articles/data-preservation-check-before-production-release";
import { post as deliveryModuleScanBoxesNeverTypeSerialsPost } from "./articles/delivery-module-scan-boxes-never-type-serials";
import { post as dependentDropDownListsExcelIndirectNamedRangesPost } from "./articles/dependent-drop-down-lists-excel-indirect-named-ranges";
import { post as derivedConfigurationHealthChecksPost } from "./articles/derived-configuration-health-checks";
import { post as derivedInventoryFromALedgerNotAStoredBalancePost } from "./articles/derived-inventory-from-a-ledger-not-a-stored-balance";
import { post as deterministicRuleEngineForVagueAcceptanceCriteriaPost } from "./articles/deterministic-rule-engine-for-vague-acceptance-criteria";
import { post as documentingAnExcelTrackerForNonTechnicalUsersPost } from "./articles/documenting-an-excel-tracker-for-non-technical-users";
import { post as enforcingArchitectureBoundariesWithATestInNextjsPost } from "./articles/enforcing-architecture-boundaries-with-a-test-in-nextjs";
import { post as evaluatingAVisionModelWithOnlyThirteenExamplesPost } from "./articles/evaluating-a-vision-model-with-only-thirteen-examples";
import { post as evaluatingAnLlmAppWhenYourOwnSystemHidesTheResultPost } from "./articles/evaluating-an-llm-app-when-your-own-system-hides-the-result";
import { post as exposingLocalOllamaToVercelThroughATokenGatewayPost } from "./articles/exposing-local-ollama-to-vercel-through-a-token-gateway";
import { post as express5PgliteApiJwtSecurityTestsPost } from "./articles/express-5-pglite-api-jwt-security-tests";
import { post as extractingTextFromAcademicPdfsWithPypdfPost } from "./articles/extracting-text-from-academic-pdfs-with-pypdf";
import { post as fastapiAndNextjsAsTwoServicesOnOneVercelOriginPost } from "./articles/fastapi-and-nextjs-as-two-services-on-one-vercel-origin";
import { post as fillAWordTemplateInNodejsWithJszipPost } from "./articles/fill-a-word-template-in-nodejs-with-jszip";
import { post as fourKindsOfUnclearDecisionStatesForAnAiCheckPost } from "./articles/four-kinds-of-unclear-decision-states-for-an-ai-check";
import { post as freeTierTokenLimitSmallerThanOneRequestPost } from "./articles/free-tier-token-limit-smaller-than-one-request";
import { post as freezingLabelTemplatesWithRasterHashTestsPost } from "./articles/freezing-label-templates-with-raster-hash-tests";
import { post as gaplessMonthlyRequestNumbersInPostgresPost } from "./articles/gapless-monthly-request-numbers-in-postgres";
import { post as generatingAnXcodeProjectFileFromAScriptPost } from "./articles/generating-an-xcode-project-file-from-a-script";
import { post as generatingInventorySkusInExcelWithLetAndTextjoinPost } from "./articles/generating-inventory-skus-in-excel-with-let-and-textjoin";
import { post as googleOidcPkceDeviceProvisioningRevocableTokensPost } from "./articles/google-oidc-pkce-device-provisioning-revocable-tokens";
import { post as hardeningAPublicPhotoUploadExifMagicBytesAndReEncodingPost } from "./articles/hardening-a-public-photo-upload-exif-magic-bytes-and-re-encoding";
import { post as hmacSignedSessionCookiesWithoutALibraryPost } from "./articles/hmac-signed-session-cookies-without-a-library";
import { post as ignoringAdvertPricesWhenReadingPaymentScreenshotsPost } from "./articles/ignoring-advert-prices-when-reading-payment-screenshots";
import { post as immutableReferenceDataPostgresTriggersAndHashPinningPost } from "./articles/immutable-reference-data-postgres-triggers-and-hash-pinning";
import { post as implementedAvailableNotConnectedStatusHonestyPost } from "./articles/implemented-available-not-connected-status-honesty";
import { post as inAppTestRunnerAndXcuitestForAnIosAppPost } from "./articles/in-app-test-runner-and-xcuitest-for-an-ios-app";
import { post as instrumentingAWebBluetoothPrintPipelinePost } from "./articles/instrumenting-a-web-bluetooth-print-pipeline";
import { post as iosShareExtensionOcrSharedSwiftdataStorePost } from "./articles/ios-share-extension-ocr-shared-swiftdata-store";
import { post as keepingContactDetailsOffAPublicLinkPagePost } from "./articles/keeping-contact-details-off-a-public-link-page";
import { post as literatureReviewAcrossPapersFromStoredAnalysesPost } from "./articles/literature-review-across-papers-from-stored-analyses";
import { post as llmRateLimitsAndSdkHiddenRetriesPost } from "./articles/llm-rate-limits-and-sdk-hidden-retries";
import { post as localFirstSyncConflictPolicyOfflinePwaPost } from "./articles/local-first-sync-conflict-policy-offline-pwa";
import { post as loggingApplePayPurchasesWithAppIntentsWalletAutomationPost } from "./articles/logging-apple-pay-purchases-with-app-intents-wallet-automation";
import { post as loggingStatusChangesInExcelWithVbaToMeasureStageTimePost } from "./articles/logging-status-changes-in-excel-with-vba-to-measure-stage-time";
import { post as logoutStillWorkedFor30SecondsTokenCacheServerlessPost } from "./articles/logout-still-worked-for-30-seconds-token-cache-serverless";
import { post as makingAnInvalidConfigStateUnrepresentableInPostgresPost } from "./articles/making-an-invalid-config-state-unrepresentable-in-postgres";
import { post as malaysianPaymentScreenshotParserFalsePositivesPost } from "./articles/malaysian-payment-screenshot-parser-false-positives";
import { post as mappingAnExcelTrackerToADatabaseSchemaPost } from "./articles/mapping-an-excel-tracker-to-a-database-schema";
import { post as measuredVsEstimatedFuelEconomyFullTankMethodPost } from "./articles/measured-vs-estimated-fuel-economy-full-tank-method";
import { post as modellingARefurbishmentPipelineInExcelPost } from "./articles/modelling-a-refurbishment-pipeline-in-excel";
import { post as modellingSpendingCashFlowAndWhoOwesWhomPost } from "./articles/modelling-spending-cash-flow-and-who-owes-whom";
import { post as neverCreateIndexesFromApplicationStartupPost } from "./articles/never-create-indexes-from-application-startup";
import { post as nextjs16ProxyTsSupabaseSessionRefreshPost } from "./articles/nextjs-16-proxy-ts-supabase-session-refresh";
import { post as nextjsErrorBoundaryAutoRetryJitterPost } from "./articles/nextjs-error-boundary-auto-retry-jitter";
import { post as nextjsOpengraphMetadataReplacesNotMergesPost } from "./articles/nextjs-opengraph-metadata-replaces-not-merges";
import { post as niimbotB1ProBleProtocolPrintSequencePost } from "./articles/niimbot-b1-pro-ble-protocol-print-sequence";
import { post as nodeSpawnOnWindowsProgramFilesPathAndStalePathPost } from "./articles/node-spawn-on-windows-program-files-path-and-stale-path";
import { post as odometerOcrTesseractSharpPreprocessingPlausibilityPost } from "./articles/odometer-ocr-tesseract-sharp-preprocessing-plausibility";
import { post as offlineSyncDeletesTombstonesLastWriteWinsPost } from "./articles/offline-sync-deletes-tombstones-last-write-wins";
import { post as oneJsonLdGraphPersonReferencedByIdPost } from "./articles/one-json-ld-graph-person-referenced-by-id";
import { post as onePostgresFunctionForAWholeAnalyticsDashboardPost } from "./articles/one-postgres-function-for-a-whole-analytics-dashboard";
import { post as onePureFunctionForPreviewAndCommitPost } from "./articles/one-pure-function-for-preview-and-commit";
import { post as onePydanticSchemaTwoLlmVendorsStructuredOutputPost } from "./articles/one-pydantic-schema-two-llm-vendors-structured-output";
import { post as optimisticConcurrencyPostgresUpsertRevision409Post } from "./articles/optimistic-concurrency-postgres-upsert-revision-409";
import { post as paymentChannelVsFundingAccountApplePayReconciliationPost } from "./articles/payment-channel-vs-funding-account-apple-pay-reconciliation";
import { post as photoQualityGateBlurGlareExposureBeforeAVisionModelPost } from "./articles/photo-quality-gate-blur-glare-exposure-before-a-vision-model";
import { post as planningAUniversityProjectLikeAProductionSystemPost } from "./articles/planning-a-university-project-like-a-production-system";
import { post as portingAStaticPageToNextjsWithoutVisualDriftPost } from "./articles/porting-a-static-page-to-nextjs-without-visual-drift";
import { post as postgresBulkInsertBindParameterLimitUnnestPost } from "./articles/postgres-bulk-insert-bind-parameter-limit-unnest";
import { post as postgresJsJsonbDoubleEncodingSqlJsonPost } from "./articles/postgres-js-jsonb-double-encoding-sql-json";
import { post as postgresJsTimestamptzMicrosecondsLostInBindingPost } from "./articles/postgres-js-timestamptz-microseconds-lost-in-binding";
import { post as productionWriteLockReadOnlyModeNextjsMiddlewarePost } from "./articles/production-write-lock-read-only-mode-nextjs-middleware";
import { post as promiseRaceTimeoutLeaksPostgresConnectionsPost } from "./articles/promise-race-timeout-leaks-postgres-connections";
import { post as qualificationGateComputingWhatAModelIsAllowedToDecidePost } from "./articles/qualification-gate-computing-what-a-model-is-allowed-to-decide";
import { post as rateLimitingAPublicEndpointOnServerlessHmacOfIpPost } from "./articles/rate-limiting-a-public-endpoint-on-serverless-hmac-of-ip";
import { post as remediatingACodeAuditWithP0FindingsPost } from "./articles/remediating-a-code-audit-with-p0-findings";
import { post as removingDefaultValuesThatLookLikeDataPost } from "./articles/removing-default-values-that-look-like-data";
import { post as renderingLabelsForA576DotThermalPrintheadPost } from "./articles/rendering-labels-for-a-576-dot-thermal-printhead";
import { post as rtlArabicDashboardInNextjsWithTypedI18nPost } from "./articles/rtl-arabic-dashboard-in-nextjs-with-typed-i18n";
import { post as runningQwen25Vl7bOnIntelIrisXeWithOllamaVulkanPost } from "./articles/running-qwen2-5-vl-7b-on-intel-iris-xe-with-ollama-vulkan";
import { post as schemaSetupOnColdStartWithoutARacePost } from "./articles/schema-setup-on-cold-start-without-a-race";
import { post as schemaSkewDegradeOneMigrationAtATimePost } from "./articles/schema-skew-degrade-one-migration-at-a-time";
import { post as securityHeadersForAWebBluetoothPwaPost } from "./articles/security-headers-for-a-web-bluetooth-pwa";
import { post as securityHeadersNextjsAndWhyCspWaitedPost } from "./articles/security-headers-nextjs-and-why-csp-waited";
import { post as selfHostingNodePostgresqlNginxSystemdUbuntuPost } from "./articles/self-hosting-node-postgresql-nginx-systemd-ubuntu";
import { post as senderVsRecipientBankInMalaysianTransferReceiptsPost } from "./articles/sender-vs-recipient-bank-in-malaysian-transfer-receipts";
import { post as serialNumberModelDetectionByPrefixRulesPost } from "./articles/serial-number-model-detection-by-prefix-rules";
import { post as shadowTestingAReplacementModelWithNextjsAfterPost } from "./articles/shadow-testing-a-replacement-model-with-nextjs-after";
import { post as sharingOneSupabaseProjectBetweenTwoAppsPost } from "./articles/sharing-one-supabase-project-between-two-apps";
import { post as sortingVisionTextObservationsIntoRowsPost } from "./articles/sorting-vision-text-observations-into-rows";
import { post as splittingABillInIntegerSenLargestRemainderPost } from "./articles/splitting-a-bill-in-integer-sen-largest-remainder";
import { post as staleResponsesOverwriteNewerFilterResultsReactPost } from "./articles/stale-responses-overwrite-newer-filter-results-react";
import { post as stockRequestWorkflowWithAStateMachineAndEventLogPost } from "./articles/stock-request-workflow-with-a-state-machine-and-event-log";
import { post as stopVercelPreviewDeploymentsUsingProductionDatabasePost } from "./articles/stop-vercel-preview-deployments-using-production-database";
import { post as storingUploadedPhotosInPostgresByteaAdminOnlyPost } from "./articles/storing-uploaded-photos-in-postgres-bytea-admin-only";
import { post as structuredDataForALocalRecyclingBusinessPost } from "./articles/structured-data-for-a-local-recycling-business";
import { post as supabaseFreePlanBackupJsonExportRestorePost } from "./articles/supabase-free-plan-backup-json-export-restore";
import { post as supabaseGoogleSignInIosPkceWithoutGoogleSdkPost } from "./articles/supabase-google-sign-in-ios-pkce-without-google-sdk";
import { post as supabaseGoogleSignInRedirectsToLocalhostWithTokenPost } from "./articles/supabase-google-sign-in-redirects-to-localhost-with-token";
import { post as supabaseSessionPoolerEmaxconnsessionPostmortemPost } from "./articles/supabase-session-pooler-emaxconnsession-postmortem";
import { post as swiftdataVersionedSchemaMigrationWithoutLosingDataPost } from "./articles/swiftdata-versioned-schema-migration-without-losing-data";
import { post as testingAnLlmAppWithoutCallingPaidApisPost } from "./articles/testing-an-llm-app-without-calling-paid-apis";
import { post as testingEveryNextjsApiRouteRefusesWithoutSessionPost } from "./articles/testing-every-nextjs-api-route-refuses-without-session";
import { post as testingPostgresInVitestWithPgliteAndPostgresJsPost } from "./articles/testing-postgres-in-vitest-with-pglite-and-postgres-js";
import { post as testingPwaOfflineBootHeadlessChromeDevtoolsProtocolPost } from "./articles/testing-pwa-offline-boot-headless-chrome-devtools-protocol";
import { post as testingWithoutPaidApisOrHardwareAndWhereFakesLiePost } from "./articles/testing-without-paid-apis-or-hardware-and-where-fakes-lie";
import { post as themeSpecificLogosWithoutAFlashPost } from "./articles/theme-specific-logos-without-a-flash";
import { post as twoWaysToUseSupabaseRowLevelSecurityPost } from "./articles/two-ways-to-use-supabase-row-level-security";
import { post as vbaMapColumnsByHeaderNameNotColumnNumberPost } from "./articles/vba-map-columns-by-header-name-not-column-number";
import { post as vercelOrASelfHostedUbuntuServerChoosingPerAppPost } from "./articles/vercel-or-a-self-hosted-ubuntu-server-choosing-per-app";
import { post as versioningAnOperationalSpreadsheetLikeSoftwarePost } from "./articles/versioning-an-operational-spreadsheet-like-software";
import { post as whatADedicatedInferenceServerWillAndWontFixPost } from "./articles/what-a-dedicated-inference-server-will-and-wont-fix";
import { post as whenProductionBreaksAndNothingChangedPausedFreeTierDatabasePost } from "./articles/when-production-breaks-and-nothing-changed-paused-free-tier-database";
import { post as wholeDocumentContextInsteadOfRagForPaperAnalysisPost } from "./articles/whole-document-context-instead-of-rag-for-paper-analysis";
import { post as workboxConflictingPrecacheEntriesEmptyCachePost } from "./articles/workbox-conflicting-precache-entries-empty-cache";
import { post as writingAPageAiAnswerEnginesCanQuotePost } from "./articles/writing-a-page-ai-answer-engines-can-quote";
import { post as wrongSupabaseKeyReturns200AndZeroRowsPost } from "./articles/wrong-supabase-key-returns-200-and-zero-rows";

/**
 * Every article, including those scheduled for a later publication date.
 * Nothing outside this module should list these directly: use
 * `publishedPosts()`, which is what every page, feed and sitemap reads.
 */
export const allPosts: BlogPost[] = [
  productionManagementSystem,
  manualTrackingProblems,
  adminPanels,
  manualToDigital,
  physicalProcess,
  maintenance,
  figmaFirst,
  figmaToProduction,
  figmaComponents,
  responsiveDesign,
  itSystemsRole,
  repetitiveWork,
  internalUx,
  reporting,
  prototypeRebuild,
  staticVerification,
  imagePayload,
  llmGroundedness,
  providerFallback,
  rlsInert,
  githubHeatmap,
  cvGrant,
  storageBackends,
  stagedCsv,
  businessDay,
  webBluetooth,
  visionObserves,
  cyberjayaEnvironment,
  addingLabelPrintingToANextjsAppThroughARelayPagePost,
  analyticsRetentionRollupsWithPgCronPost,
  appGroupSwiftdataStoreWasNeverTheOneInUsePost,
  appendOnlyCloudBackupSupabaseStorageRlsPost,
  appleFoundationModelsStructuredReceiptExtractionPost,
  auditLogWithBeforeSnapshotsForDestructiveActionsPost,
  barcodeScannerWebAppScanPasteAndBeepPost,
  benchmarkRegressionGateMediansNoiseFloorPost,
  benchmarkingOllamaVisionModelsTheCachedImageTrapPost,
  blankIsNotZeroProductionReportInputsPost,
  cachingLlmResultsByContentHashWithoutLeakingUploadersPost,
  callingPostgrestFromPythonWhatMocksMissPost,
  canonicalUrlsApexWww308SitemapRedirectsNextjsPost,
  cappingImageSizeForAVisionModelInsideA60SecondLimitPost,
  choosingAnEmbeddingModelUnderPgvectors2000DimensionLimitPost,
  chromeBackgroundTabTimerThrottlingWebWorkerPost,
  comparisonBaselinesForAnOperationsDashboardPost,
  contactFormSpamProtectionWithoutCaptchaPost,
  continuousLabelPrintingPageCounterAndUncertainJobsPost,
  contributingFixesToAWebAppYouDidNotBuildPost,
  cookielessFirstPartyAnalyticsWithADailySaltedIpHashPost,
  countingSharedPackagingConsumptionAcrossDaysPost,
  crossAppPrintingBroadcastchannelWebLocksPost,
  csvFormulaInjectionInExportsPost,
  dataPreservationCheckBeforeProductionReleasePost,
  deliveryModuleScanBoxesNeverTypeSerialsPost,
  dependentDropDownListsExcelIndirectNamedRangesPost,
  derivedConfigurationHealthChecksPost,
  derivedInventoryFromALedgerNotAStoredBalancePost,
  deterministicRuleEngineForVagueAcceptanceCriteriaPost,
  documentingAnExcelTrackerForNonTechnicalUsersPost,
  enforcingArchitectureBoundariesWithATestInNextjsPost,
  evaluatingAVisionModelWithOnlyThirteenExamplesPost,
  evaluatingAnLlmAppWhenYourOwnSystemHidesTheResultPost,
  exposingLocalOllamaToVercelThroughATokenGatewayPost,
  express5PgliteApiJwtSecurityTestsPost,
  extractingTextFromAcademicPdfsWithPypdfPost,
  fastapiAndNextjsAsTwoServicesOnOneVercelOriginPost,
  fillAWordTemplateInNodejsWithJszipPost,
  fourKindsOfUnclearDecisionStatesForAnAiCheckPost,
  freeTierTokenLimitSmallerThanOneRequestPost,
  freezingLabelTemplatesWithRasterHashTestsPost,
  gaplessMonthlyRequestNumbersInPostgresPost,
  generatingAnXcodeProjectFileFromAScriptPost,
  generatingInventorySkusInExcelWithLetAndTextjoinPost,
  googleOidcPkceDeviceProvisioningRevocableTokensPost,
  hardeningAPublicPhotoUploadExifMagicBytesAndReEncodingPost,
  hmacSignedSessionCookiesWithoutALibraryPost,
  ignoringAdvertPricesWhenReadingPaymentScreenshotsPost,
  immutableReferenceDataPostgresTriggersAndHashPinningPost,
  implementedAvailableNotConnectedStatusHonestyPost,
  inAppTestRunnerAndXcuitestForAnIosAppPost,
  instrumentingAWebBluetoothPrintPipelinePost,
  iosShareExtensionOcrSharedSwiftdataStorePost,
  keepingContactDetailsOffAPublicLinkPagePost,
  literatureReviewAcrossPapersFromStoredAnalysesPost,
  llmRateLimitsAndSdkHiddenRetriesPost,
  localFirstSyncConflictPolicyOfflinePwaPost,
  loggingApplePayPurchasesWithAppIntentsWalletAutomationPost,
  loggingStatusChangesInExcelWithVbaToMeasureStageTimePost,
  logoutStillWorkedFor30SecondsTokenCacheServerlessPost,
  makingAnInvalidConfigStateUnrepresentableInPostgresPost,
  malaysianPaymentScreenshotParserFalsePositivesPost,
  mappingAnExcelTrackerToADatabaseSchemaPost,
  measuredVsEstimatedFuelEconomyFullTankMethodPost,
  modellingARefurbishmentPipelineInExcelPost,
  modellingSpendingCashFlowAndWhoOwesWhomPost,
  neverCreateIndexesFromApplicationStartupPost,
  nextjs16ProxyTsSupabaseSessionRefreshPost,
  nextjsErrorBoundaryAutoRetryJitterPost,
  nextjsOpengraphMetadataReplacesNotMergesPost,
  niimbotB1ProBleProtocolPrintSequencePost,
  nodeSpawnOnWindowsProgramFilesPathAndStalePathPost,
  odometerOcrTesseractSharpPreprocessingPlausibilityPost,
  offlineSyncDeletesTombstonesLastWriteWinsPost,
  oneJsonLdGraphPersonReferencedByIdPost,
  onePostgresFunctionForAWholeAnalyticsDashboardPost,
  onePureFunctionForPreviewAndCommitPost,
  onePydanticSchemaTwoLlmVendorsStructuredOutputPost,
  optimisticConcurrencyPostgresUpsertRevision409Post,
  paymentChannelVsFundingAccountApplePayReconciliationPost,
  photoQualityGateBlurGlareExposureBeforeAVisionModelPost,
  planningAUniversityProjectLikeAProductionSystemPost,
  portingAStaticPageToNextjsWithoutVisualDriftPost,
  postgresBulkInsertBindParameterLimitUnnestPost,
  postgresJsJsonbDoubleEncodingSqlJsonPost,
  postgresJsTimestamptzMicrosecondsLostInBindingPost,
  productionWriteLockReadOnlyModeNextjsMiddlewarePost,
  promiseRaceTimeoutLeaksPostgresConnectionsPost,
  qualificationGateComputingWhatAModelIsAllowedToDecidePost,
  rateLimitingAPublicEndpointOnServerlessHmacOfIpPost,
  remediatingACodeAuditWithP0FindingsPost,
  removingDefaultValuesThatLookLikeDataPost,
  renderingLabelsForA576DotThermalPrintheadPost,
  rtlArabicDashboardInNextjsWithTypedI18nPost,
  runningQwen25Vl7bOnIntelIrisXeWithOllamaVulkanPost,
  schemaSetupOnColdStartWithoutARacePost,
  schemaSkewDegradeOneMigrationAtATimePost,
  securityHeadersForAWebBluetoothPwaPost,
  securityHeadersNextjsAndWhyCspWaitedPost,
  selfHostingNodePostgresqlNginxSystemdUbuntuPost,
  senderVsRecipientBankInMalaysianTransferReceiptsPost,
  serialNumberModelDetectionByPrefixRulesPost,
  shadowTestingAReplacementModelWithNextjsAfterPost,
  sharingOneSupabaseProjectBetweenTwoAppsPost,
  sortingVisionTextObservationsIntoRowsPost,
  splittingABillInIntegerSenLargestRemainderPost,
  staleResponsesOverwriteNewerFilterResultsReactPost,
  stockRequestWorkflowWithAStateMachineAndEventLogPost,
  stopVercelPreviewDeploymentsUsingProductionDatabasePost,
  storingUploadedPhotosInPostgresByteaAdminOnlyPost,
  structuredDataForALocalRecyclingBusinessPost,
  supabaseFreePlanBackupJsonExportRestorePost,
  supabaseGoogleSignInIosPkceWithoutGoogleSdkPost,
  supabaseGoogleSignInRedirectsToLocalhostWithTokenPost,
  supabaseSessionPoolerEmaxconnsessionPostmortemPost,
  swiftdataVersionedSchemaMigrationWithoutLosingDataPost,
  testingAnLlmAppWithoutCallingPaidApisPost,
  testingEveryNextjsApiRouteRefusesWithoutSessionPost,
  testingPostgresInVitestWithPgliteAndPostgresJsPost,
  testingPwaOfflineBootHeadlessChromeDevtoolsProtocolPost,
  testingWithoutPaidApisOrHardwareAndWhereFakesLiePost,
  themeSpecificLogosWithoutAFlashPost,
  twoWaysToUseSupabaseRowLevelSecurityPost,
  vbaMapColumnsByHeaderNameNotColumnNumberPost,
  vercelOrASelfHostedUbuntuServerChoosingPerAppPost,
  versioningAnOperationalSpreadsheetLikeSoftwarePost,
  whatADedicatedInferenceServerWillAndWontFixPost,
  whenProductionBreaksAndNothingChangedPausedFreeTierDatabasePost,
  wholeDocumentContextInsteadOfRagForPaperAnalysisPost,
  workboxConflictingPrecacheEntriesEmptyCachePost,
  writingAPageAiAnswerEnginesCanQuotePost,
  wrongSupabaseKeyReturns200AndZeroRowsPost,
];

export const categories: PostCategory[] = [
  "Building Real Systems",
  "Full-Stack Development",
  "AI & Automation",
  "UI/UX & Product",
  "Developer Journey",
  "Malaysia & Cyberjaya",
];

/* ------------------------------------------------------------------------ */
/* Lookups                                                                   */
/* ------------------------------------------------------------------------ */

/** Today's date in Malaysia, where the site publishes, as YYYY-MM-DD. */
export function todayInMalaysia(now: number = Date.now()): string {
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Articles whose publication date has arrived.
 *
 * An article's `date` is when it is published here, never back-dated, so a
 * batch written together is released on an editorial schedule instead: an
 * article dated in the future stays out of every listing, route, feed and
 * sitemap until that day. Evaluated per call rather than once at import, so a
 * long-lived server notices the day change; the blog routes revalidate hourly
 * to pick it up.
 */
export function publishedPosts(): BlogPost[] {
  const today = todayInMalaysia();
  return allPosts.filter((p) => p.date <= today);
}

export function getPost(slug: string) {
  return publishedPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: PostCategory) {
  return sortedPosts().filter((p) => p.category === category);
}

/** Categories that actually have at least one post. */
export function usedCategories(): PostCategory[] {
  const published = publishedPosts();
  return categories.filter((c) => published.some((p) => p.category === c));
}

/**
 * Related reading for an article.
 *
 * Hand-picked `relatedPosts` come first, because a curated pair is always
 * better than a category match. Same-category posts fill any remaining slots,
 * which is what keeps this useful as the library grows past the point where
 * "same category" means anything on its own.
 */
export function getRelatedPosts(post: BlogPost, limit = 3) {
  const picked = (post.relatedPosts ?? [])
    .map((slug) => getPost(slug))
    .filter((p): p is BlogPost => Boolean(p) && p!.slug !== post.slug);

  const seen = new Set(picked.map((p) => p.slug));
  const sameCategory = sortedPosts().filter(
    (p) => p.slug !== post.slug && p.category === post.category && !seen.has(p.slug)
  );

  return [...picked, ...sameCategory].slice(0, limit);
}

/**
 * Articles that draw on a given project.
 *
 * Reads the structured `relatedProjects` field, and falls back to the older
 * hand-written `related` links so no existing relationship is lost.
 */
export function getPostsForProject(projectSlug: string) {
  const href = `/work/${projectSlug}`;
  return sortedPosts().filter(
    (p) =>
      p.relatedProjects?.includes(projectSlug) ||
      p.related?.some((link) => link.href === href)
  );
}

/** Newest first. */
export function sortedPosts() {
  return publishedPosts().sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Falls back to `description` so every card and meta tag has copy. */
export function postExcerpt(post: BlogPost) {
  return post.excerpt ?? post.description;
}

/* ------------------------------------------------------------------------ */
/* Text                                                                      */
/* ------------------------------------------------------------------------ */

/** The readable text of one block, for word counts and feeds. */
export function blockText(block: string | Block): string {
  if (typeof block === "string") return block;
  switch (block.type) {
    case "list":
      return block.items.join(" ");
    case "code":
      return block.caption ?? "";
    case "callout":
      return block.text;
    case "flow":
      return block.steps.join(" ");
    case "image":
      return block.caption ?? block.alt;
    case "table":
      return [block.head.join(" "), ...block.rows.map((r) => r.join(" "))].join(" ");
  }
}

export function sectionsText(sections: PostSection[]): string {
  return sections
    .flatMap((s) => [s.heading, ...s.body.map(blockText)])
    .join(" ");
}

export function postWordCount(post: BlogPost): number {
  return sectionsText(post.sections).split(/\s+/).filter(Boolean).length;
}

/**
 * A date-only field as an ISO 8601 instant with the time zone the site
 * publishes in. Google asks for the zone on datePublished and dateModified;
 * without one, the crawler's own zone is assumed.
 */
export function publishedAt(date: string): string {
  return `${date}T00:00:00+08:00`;
}

/** A URL-safe id for a section heading, so a table of contents can link to it. */
export function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
