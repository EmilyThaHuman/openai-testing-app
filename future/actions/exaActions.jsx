"use server";

import Exa from "exa-js";

const exa = new Exa(import.meta.env.EXA_API_KEY);

export async function searchExaAction(userQuery) {
  try {
    const result = await exa.searchAndContents(userQuery, {
      type: "neural",
      useAutoprompt: true,
      numResults: 5,
      text: true,
      livecrawl: "always",
      summary: true
    });

    const formattedResults = {
      results: result.results.map((r) => ({
        title: r.title || "",
        url: r.url,
        text: r.text,
        summary: r.summary
      }))
    };

    return {
      isSuccess: true,
      message: "Successfully retrieved Exa results",
      data: formattedResults
    };
  } catch (error) {
    console.error("Error searching Exa:", error);
    return {
      isSuccess: false,
      message: "Failed to retrieve Exa results"
    };
  }
}