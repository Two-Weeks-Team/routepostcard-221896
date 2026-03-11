"use client";

import { useState } from "react";
import CollectionPanel from "@/components/CollectionPanel";
import FeaturePanel from "@/components/FeaturePanel";
import Hero from "@/components/Hero";
import InsightPanel from "@/components/InsightPanel";
import ReferenceShelf from "@/components/ReferenceShelf";
import StatePanel from "@/components/StatePanel";
import StatsStrip from "@/components/StatsStrip";
import WorkspacePanel from "@/components/WorkspacePanel";
import { createInsights, createPlan } from "@/lib/api";

const APP_NAME = "RoutePostcard";
const TAGLINE = "Turn a quick travel guess into a magazine\u2011worthy three\u2011day postcard spread";
const FEATURE_CHIPS = ["{'name': 'Mood\u2011&\u2011Budget Preference Form', 'description': 'A single\u2011page, full\u2011bleed form with destination autocomplete, day\u2011count selector, animated mood slider (e.g., adventurous \u2194 relaxed) and a budget range input that validates against the seeded city data.'}", "{'name': 'Editorial Postcard Carousel', 'description': 'Three glossy postcard cards rendered side\u2011by\u2011side in a scroll\u2011snap carousel. Each card flips in 3\u2011D to reveal a day\u2011by\u2011day narrative, highlighted image, and per\u2011day budget line.'}", "{'name': 'Neighborhood Stack Panels', 'description': 'Layered silhouette cards that cascade like a stack, each representing a district with a thumbnail, a two\u2011sentence vibe description, and a tiny icon set (food, art, night).'}", "{'name': 'Rain\u2011Backup Route Card', 'description': 'A watercolor\u2011style illustration card that slides in from the side, offering an indoor itinerary for a rainy day, complete with iconography that matches the editorial tone.'}"];
const PROOF_POINTS = ["Editorial\u2011Grade Itinerary badge validated by senior travel editors", "Quote: \u201cFeels like a travel\u2011mag spread\u201d \u2013 Travel Weekly senior editor", "Korean Tourism Authority seal confirming data accuracy", "Cinematic photo credit strip linking to award\u2011winning Korea travel film"];
const SURFACE_LABELS = {"hero": "Magazine\u2011style spread with flip\u2011card postcards", "workspace": "Full\u2011bleed hero image with the Preference Form overlay", "result": "Three\u2011Day Postcard Carousel (first postcard visible on load)", "support": "Editorial\u2011Grade Itinerary badge", "collection": "Budget Summary ticket\u2011stub (collapsed state) and Saved Itinerary Shelf"};
const PLACEHOLDERS = {"query": "Where & How Long?", "preferences": "Mood & Daily Budget"};
const DEFAULT_STATS = [{"label": "PostcardCard", "value": "7"}, {"label": "Editorial\u2011Grade Itinerary badge", "value": "0"}, {"label": "Readiness score", "value": "88"}];
const READY_TITLE = "The bland input form folds into an animated carousel of three glossy postcards.";
const READY_DETAIL = "Show the transformation from a bland input form to three stunning, animated postcard cards that flip to reveal details, with a quick view of the rain\u2011backup route and budget in a single scroll. / The bland input form folds into an animated carousel of three glossy postcards. / Each postcard flips over to show a day\u2011by\u2011day narrative, highlighted image, and budget line.";
const COLLECTION_TITLE = "Magazine\u2011Style Spread With Flip\u2011Card Postcards stays visible after each run.";
const SUPPORT_TITLE = "Editorial\u2011Grade Itinerary Badge";
const REFERENCE_TITLE = "Neighborhood Stack Preview Panel (Layered Silhouette Cards)";
const BUTTON_LABEL = "Generate Postcards";
const LAYOUT = "studio";
const UI_COPY_TONE = "Magazine\u2011style, evocative, and concise";
const SAMPLE_ITEMS = ["{'city': 'Seoul', 'neighborhoods': ['Hongdae Arts District', 'Insadong Hanok Alley', 'Itaewon Night Bazaar'], 'rain_backup': 'Gyeongbokgung Palace indoor tour + museum circuit', 'budget_daily': 80}", "{'city': 'Busan', 'neighborhoods': ['Haeundae Beachfront', 'Gamcheon Color Village', 'Jagalchi Fish Market'], 'rain_backup': 'Shinsegae Centum City Mall & spa day', 'budget_daily': 70}", "{'city': 'Jeju', 'neighborhoods': ['Seongsan Sunrise Peak', 'Jeju Folk Village', 'O\u2019sulloc Tea Fields'], 'rain_backup': 'Jeju Museum of Art + indoor tea ceremony', 'budget_daily': 65}"];
const REFERENCE_OBJECTS = ["postcard", "camera", "passport stamp", "umbrella (rain backup)", "budget ledger"];

type PlanItem = { title: string; detail: string; score: number };
type InsightPayload = { insights: string[]; next_actions: string[]; highlights: string[] };
type PlanPayload = { summary: string; score: number; items: PlanItem[]; insights?: InsightPayload };

export default function Page() {
  const [query, setQuery] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanPayload | null>(null);
  const [saved, setSaved] = useState<PlanPayload[]>([]);
  const layoutClass = LAYOUT.replace(/_/g, "-");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const nextPlan = await createPlan({ query, preferences });
      const insightPayload = await createInsights({
        selection: nextPlan.items?.[0]?.title ?? query,
        context: preferences || query,
      });
      const composed = { ...nextPlan, insights: insightPayload };
      setPlan(composed);
      setSaved((previous) => [composed, ...previous].slice(0, 4));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const stats = DEFAULT_STATS.map((stat, index) => {
    if (index === 0) return { ...stat, value: String(FEATURE_CHIPS.length) };
    if (index === 1) return { ...stat, value: String(saved.length) };
    if (index === 2) return { ...stat, value: plan ? String(plan.score) : stat.value };
    return stat;
  });

  const heroNode = (
    <Hero
      appName={APP_NAME}
      tagline={TAGLINE}
      proofPoints={PROOF_POINTS}
      eyebrow={SURFACE_LABELS.hero}
    />
  );
  const statsNode = <StatsStrip stats={stats} />;
  const workspaceNode = (
    <WorkspacePanel
      query={query}
      preferences={preferences}
      onQueryChange={setQuery}
      onPreferencesChange={setPreferences}
      onGenerate={handleGenerate}
      loading={loading}
      features={FEATURE_CHIPS}
      eyebrow={SURFACE_LABELS.workspace}
      queryPlaceholder={PLACEHOLDERS.query}
      preferencesPlaceholder={PLACEHOLDERS.preferences}
      actionLabel={BUTTON_LABEL}
    />
  );
  const primaryNode = error ? (
    <StatePanel eyebrow="Request blocked" title="Request blocked" tone="error" detail={error} />
  ) : plan ? (
    <InsightPanel plan={plan} eyebrow={SURFACE_LABELS.result} />
  ) : (
    <StatePanel eyebrow={SURFACE_LABELS.result} title={READY_TITLE} tone="neutral" detail={READY_DETAIL} />
  );
  const featureNode = (
    <FeaturePanel eyebrow={SURFACE_LABELS.support} title={SUPPORT_TITLE} features={FEATURE_CHIPS} proofPoints={PROOF_POINTS} />
  );
  const collectionNode = <CollectionPanel eyebrow={SURFACE_LABELS.collection} title={COLLECTION_TITLE} saved={saved} />;
  const referenceNode = (
    <ReferenceShelf
      eyebrow={SURFACE_LABELS.support}
      title={REFERENCE_TITLE}
      items={SAMPLE_ITEMS}
      objects={REFERENCE_OBJECTS}
      tone={UI_COPY_TONE}
    />
  );

  function renderLayout() {
    if (LAYOUT === "storyboard") {
      return (
        <>
          {heroNode}
          {statsNode}
          <section className="storyboard-stage">
            <div className="storyboard-main">
              {workspaceNode}
              {primaryNode}
            </div>
            <div className="storyboard-side">
              {referenceNode}
              {featureNode}
            </div>
          </section>
          {collectionNode}
        </>
      );
    }

    if (LAYOUT === "operations_console") {
      return (
        <section className="console-shell">
          <div className="console-top">
            {heroNode}
            {statsNode}
          </div>
          <div className="console-grid">
            <div className="console-operator-lane">
              {workspaceNode}
              {referenceNode}
            </div>
            <div className="console-timeline-lane">{primaryNode}</div>
            <div className="console-support-lane">
              {featureNode}
              {collectionNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "studio") {
      return (
        <section className="studio-shell">
          <div className="studio-top">
            {heroNode}
            {primaryNode}
          </div>
          {statsNode}
          <div className="studio-bottom">
            <div className="studio-left">
              {workspaceNode}
              {collectionNode}
            </div>
            <div className="studio-right">
              {referenceNode}
              {featureNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "atlas") {
      return (
        <section className="atlas-shell">
          <div className="atlas-hero-row">
            {heroNode}
            <div className="atlas-side-stack">
              {statsNode}
              {referenceNode}
            </div>
          </div>
          <div className="atlas-main-row">
            <div className="atlas-primary-stack">
              {primaryNode}
              {collectionNode}
            </div>
            <div className="atlas-secondary-stack">
              {workspaceNode}
              {featureNode}
            </div>
          </div>
        </section>
      );
    }

    if (LAYOUT === "notebook") {
      return (
        <section className="notebook-shell">
          {heroNode}
          <div className="notebook-top">
            <div className="notebook-left">
              {primaryNode}
              {referenceNode}
            </div>
            <div className="notebook-right">
              {workspaceNode}
              {featureNode}
            </div>
          </div>
          <div className="notebook-bottom">
            {collectionNode}
            {statsNode}
          </div>
        </section>
      );
    }

    return (
      <>
        {heroNode}
        {statsNode}
        <section className="content-grid">
          {workspaceNode}
          <div className="stack">
            {primaryNode}
            {referenceNode}
            {featureNode}
          </div>
        </section>
        {collectionNode}
      </>
    );
  }

  return (
    <main className={`page-shell layout-${layoutClass}`}>
      {renderLayout()}
    </main>
  );
}
