"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
  { label: "In-School Students Reached", value: 2514, suffix: "", icon: "🎓" },
  { label: "Secondary Schools", value: 13, suffix: "", icon: "🏫" },
  { label: "Youth & Women Empowered", value: 3000, suffix: "+", icon: "💪" },
];

const outcomes = [
  {
    label: "GBV Awareness & Abuse Recognition",
    baseline: 34,
    endline: 89,
    delta: "+55%",
    barColor: "#2563eb",
    baseColor: "#bfdbfe",
    description:
      "Students can accurately identify non-physical forms of abuse including psychological coercion and structural denial of education.",
  },
  {
    label: "Consent Literacy & Bodily Autonomy",
    baseline: 22,
    endline: 81,
    delta: "+59%",
    barColor: "#0284c7",
    baseColor: "#bae6fd",
    description:
      "Driven by contextualised, interactive peer-led drama and teaching sessions — the most dramatic transformation observed.",
  },
  {
    label: "Confidence in Help-Seeking",
    baseline: 41,
    endline: 86,
    delta: "+45%",
    barColor: "#4f46e5",
    baseColor: "#c7d2fe",
    description:
      "Students feel equipped and secure to report threats to trained School-based GBV teams, up from prior silence due to fear.",
  },
];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const step = Math.ceil(target / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setCount(current);
            if (current >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function ProgressBar({
  baseline,
  endline,
  barColor,
  baseColor,
  animate,
}: {
  baseline: number;
  endline: number;
  barColor: string;
  baseColor: string;
  animate: boolean;
}) {
  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
        <span>BASELINE</span>
        <span>ENDLINE</span>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-none"
          style={{ width: `${baseline}%`, backgroundColor: baseColor }}
        />
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${endline}%` : `${baseline}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <div className="flex justify-between text-sm font-semibold">
        <span className="text-slate-400">{baseline}%</span>
        <span style={{ color: barColor }}>{endline}%</span>
      </div>
    </div>
  );
}

function OutcomeCard({
  item,
  index,
}: {
  item: (typeof outcomes)[0];
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s, box-shadow 0.3s`,
      }}
    >
      <div
        className="absolute top-0 left-6 h-1 w-16 rounded-full"
        style={{ backgroundColor: item.barColor }}
      />
      <div className="flex items-start justify-between gap-4 mt-1">
        <h3 className="text-sm font-semibold text-slate-700 leading-snug">
          {item.label}
        </h3>
        <span
          className="shrink-0 text-sm font-bold"
          style={{ color: item.barColor }}
        >
          {item.delta}
        </span>
      </div>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {item.description}
      </p>
      <ProgressBar
        baseline={item.baseline}
        endline={item.endline}
        barColor={item.barColor}
        baseColor={item.baseColor}
        animate={visible}
      />
    </div>
  );
}

export default function ReportPage() {
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Decorative top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

      {/* Hero header band */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div
          className="max-w-5xl mx-auto px-4 sm:px-8 py-14 space-y-4"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(-16px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-mono tracking-[0.2em] text-blue-500 uppercase">
              Interim Evaluation Report · December 2025
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-mono tracking-widest text-blue-400 uppercase">
              Quiet Shelter Empowerment Foundation
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-slate-900">
              Combatting{" "}
              <span className="text-blue-600">
                Gender-Based Violence
              </span>{" "}
              Through Sexuality Education
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              A four-year impact assessment of adolescent-focused GBV prevention
              across Adamawa State, Northeast Nigeria.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-400">
            <span>📍 Adamawa State, Nigeria</span>
            <span>👤 Prepared by Ibitomi Ibiwumui Otunola</span>
            <span>🏢 QUISEF · Programme Intern</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-20">

        {/* Key Metrics */}
        <section>
          <h2 className="text-xs font-mono tracking-[0.2em] text-blue-500 uppercase mb-6">
            Cumulative Reach
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                style={{
                  opacity: headerVisible ? 1 : 0,
                  transform: headerVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.6s ease ${0.3 + i * 0.1}s, transform 0.6s ease ${0.3 + i * 0.1}s, box-shadow 0.3s`,
                }}
              >
                <span className="text-2xl">{m.icon}</span>
                <div className="text-3xl font-bold text-blue-600">
                  <AnimatedNumber target={m.value} suffix={m.suffix} />
                </div>
                <p className="text-sm text-slate-500 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Executive Summary */}
        <section className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-xs font-mono tracking-[0.2em] text-blue-500 uppercase">
              Executive Summary
            </h2>
            <h3 className="text-2xl font-bold text-slate-900 leading-snug">
              Four Years at the Intersection of Safety & Education
            </h3>
            <div className="h-1 w-12 bg-blue-500 rounded-full" />
          </div>
          <div className="md:col-span-3 space-y-4 text-slate-600 leading-relaxed text-[15px]">
            <p>
              Over four years, the Quiet Shelter Empowerment Foundation has built a
              robust, localised model for delivering comprehensive sexuality education
              (CSE) and GBV prevention strategies in conflict-affected Northeast Nigeria.
            </p>
            <p>
              School-based interventions have reached over{" "}
              <strong className="text-slate-900">2,500 in-school adolescents</strong> across{" "}
              <strong className="text-slate-900">13 secondary schools</strong>, while broader
              community-led protection frameworks have empowered more than{" "}
              <strong className="text-slate-900">3,000 youth and women</strong>.
            </p>
            <p>
              This report synthesises historical performance data, establishes empirical
              benchmarks, and outlines the strategic roadmap to expand to{" "}
              <strong className="text-slate-900">25 schools</strong> while transitioning into
              rigorous implementation research.
            </p>
          </div>
        </section>

        {/* M&E Outcomes */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xs font-mono tracking-[0.2em] text-blue-500 uppercase mb-2">
                M&E Outcome Data
              </h2>
              <h3 className="text-2xl font-bold text-slate-900">Evidence of Effectiveness</h3>
            </div>
            <div className="hidden sm:block text-right text-xs text-slate-400 font-mono">
              <div>Pre-test / Post-test</div>
              <div>13-week curriculum cycle</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {outcomes.map((item, i) => (
              <OutcomeCard key={item.label} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* Key Insights */}
        <section>
          <h2 className="text-xs font-mono tracking-[0.2em] text-blue-500 uppercase mb-6">
            Key Insights
          </h2>
          <div className="space-y-4">
            {[
              {
                num: "01",
                title: "Deconstructing Harmful Norms",
                body: "At baseline, only 34% of students could identify non-physical abuse. By endline, this rose sharply to 89% — demonstrating that structured CSE fundamentally reshapes how young people recognise harm.",
              },
              {
                num: "02",
                title: "Consent Mastery",
                body: "Consent literacy climbed from 22% to 81%, the most dramatic outcome recorded. Contextualised peer-led drama and interactive sessions proved especially effective in this cultural context.",
              },
              {
                num: "03",
                title: "Breaking the Silence",
                body: "86% of students felt equipped to report threats to school-based GBV teams, compared to 41% at baseline who said they would suffer in silence due to fear of stigma or reprisal.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="flex gap-6 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="shrink-0 text-3xl font-black text-blue-100 group-hover:text-blue-200 transition-colors font-mono select-none">
                  {item.num}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence Limitations */}
        <section className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-2xl" />
          <h2 className="text-xs font-mono tracking-[0.2em] text-amber-500 uppercase mb-3">
            Evidence Limitations
          </h2>
          <h3 className="text-xl font-bold text-amber-900 mb-4">
            The Gap We Have Not Yet Closed
          </h3>
          <p className="text-amber-800 leading-relaxed text-[15px] max-w-3xl">
            Current monitoring conclusively proves that the curriculum shifts safety
            knowledge and trust. However, no measurement has yet been taken of how
            safety interventions affect foundational learning trajectories — literacy and
            numeracy. In Adamawa State and Nigeria more broadly, cognitive performance
            and physical safety are treated as completely distinct goals by funders.{" "}
            <strong className="text-amber-900">
              Closing this empirical gap is the core objective of the next project phase.
            </strong>
          </p>
        </section>

        {/* Implementation Research */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xs font-mono tracking-[0.2em] text-blue-500 uppercase">
              Next Phase
            </h2>
            <h3 className="text-2xl font-bold text-slate-900 leading-snug">
              Implementation Research &amp; Scale
            </h3>
            <p className="text-slate-600 leading-relaxed text-[15px]">
              A quasi-experimental trial in partnership with the{" "}
              <strong className="text-slate-900">American University of Nigeria</strong> and
              the{" "}
              <strong className="text-slate-900">
                Adamawa State Ministry of Education
              </strong>{" "}
              will map safety data against standardised foundational literacy and
              numeracy (FLN) metrics aligned with SDG 4.1.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              The goal: generate hard empirical proof that state decision-makers can use
              to determine whether, how and at what cost gender-responsive learning
              support should be integrated into the formal education system.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Target Schools", value: "25", sub: "expanding from 13" },
              { label: "Research Design", value: "QE", sub: "quasi-experimental" },
              { label: "Framework", value: "SDG 4.1", sub: "FLN metrics" },
              { label: "Partner", value: "AUN", sub: "Amer. Univ. of Nigeria" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all duration-300"
              >
                <div className="text-2xl font-black text-blue-600">{s.value}</div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-400 font-mono">
          <div>
            <div className="text-blue-500 font-semibold">
              Quiet Shelter Empowerment Foundation
            </div>
            <div>Adamawa State · Northeast Nigeria</div>
          </div>
          <div className="text-right">
            <div>Prepared by Ibitomi Ibiwumui Otunola</div>
            <div>Programme Intern · December 15, 2025</div>
          </div>
        </footer>
      </div>
    </main>
  );
}