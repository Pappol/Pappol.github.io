---
title: "Data Engineering vs. AI Work: Two Jobs Wearing the Same Badge"
description: "A reflection on how data engineering and AI/ML work actually differ day to day, why I spend more time on pipelines than on models, and why that turned out to be a good thing."
pubDate: 2026-04-28
tags: ["data-engineering", "machine-learning", "career", "reflection"]
---

My job title says AI and data engineer, and most people hear the "AI" part and picture me training models all day. The reality is that I spend far more time moving and shaping data than I do touching a model. For a while that felt like a bait-and-switch. Now I think it is the most honest description of the work.

## Two different relationships with uncertainty

The clearest difference between the two halves of the job is how they treat uncertainty.

Data engineering is, at its heart, a deterministic discipline. A pipeline either ran or it did not. A row count either matches or it does not. When something breaks, there is a cause, and you can chase it down a stack trace until you find it. The satisfaction is the satisfaction of plumbing: things flow correctly, and you can prove it.

AI and ML work lives in probability. A model is never simply correct; it is correct *often enough*, on *this distribution*, for *now*. Success is measured in metrics that drift, on data that changes underneath you. You make peace with being right on average and wrong in specific, sometimes embarrassing, cases.

Switching between these two mindsets in a single afternoon is its own small skill.

## Different definitions of "done"

In data engineering, done has edges. The schema is defined, the job is scheduled, the tests pass, the freshness SLA is met. You can put a fence around it and walk away.

In ML, done is more of a truce. The model is good enough to ship, the monitoring is in place, and you accept that you will be back. Models decay. The world they learned shifts. "Done" really means "good enough until the data tells us otherwise."

## Where they meet

Here is the thing I underestimated early on: the two are not really separate jobs. They are the same job seen from different ends.

Every model is downstream of a pipeline. The cleanest architecture and the most fashionable model will still produce nonsense if the features are computed inconsistently between training and serving. The infamous training-serving skew is, almost always, a data engineering bug wearing an ML costume.

A few patterns I now treat as non-negotiable:

- Compute features once and share them between training and inference, rather than reimplementing the logic twice and praying they match.
- Version data, not just code. A model is the product of weights *and* the data that produced them.
- Treat data quality checks as first-class, not as something you bolt on after a bad prediction shows up in front of a stakeholder.

## Why I stopped resenting the split

I used to think the pipeline work was the tax I paid to get to the interesting modeling. I had it backwards.

The modeling is often the most replaceable part of a system. Swap one architecture for another and the gain is frequently marginal. But a reliable, well-instrumented data foundation makes *every* model on top of it better, and it is the part that compounds over time. It is also the part that, when it fails silently, causes the worst kind of damage: confident answers built on quietly wrong inputs.

So these days I am happy to be the person who cares about the boring middle layer. The flashy demos get attention, but the pipelines are what let a project survive past its first month. Two jobs, one badge, and the unglamorous one turns out to matter most.
