// download-model.mjs

// We use a dynamic import(), which is native in modern JavaScript.
async function downloadEmbeddingModel() {
  console.log("Starting the one-time download for the embedding model...");
  console.log(
    "This may take several minutes depending on your internet connection."
  );

  try {
    // Dynamically import the pipeline function from the library
    const { pipeline } = await import("@xenova/transformers");

    // This line will trigger the download and show progress bars
    await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    console.log("\n✅ Model downloaded and cached successfully!");
    console.log("You can now start your main application.");
  } catch (error) {
    console.error("\n❌ Failed to download the model:", error);
  }
}

downloadEmbeddingModel();
