"""
Upwork Proposal Copywriting & Generation Service.

Synthesizes matched freelancer profile credentials, case studies, and skills
with target Upwork job requirements to craft persuasive, natural, and high-converting cover letters
and direct answers to client screening questions.
"""

import logging
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.models import (
    ProposalGenerateRequest,
    ProposalGenerateResponse,
    ScreeningAnswer,
    ProfileBase
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a friendly, highly persuasive, top-rated Upwork freelancer and agency copywriter.
Your goal is to write winning, human, and conversational Upwork proposals that get interviews.

CRITICAL UPWORK RULES:
1. FIRST 2 LINES MATTER MOST: In Upwork, clients only see the first 2 lines in their proposal inbox before clicking. DO NOT waste them on robotic corporate pleasantries like "Dear Hiring Manager", "I hope this email finds you well", "I am writing to express my interest...", or "My name is...".
2. HOOK IMMEDIATELY: Start with a warm, confident opening that directly speaks to their exact project and problem.
3. PROVE EXPERIENCE: Seamlessly cite 1 matching project or technical capability from the freelancer's actual profile.
4. ACTIONABLE INSIGHT: Offer a clear, easy-to-understand 3-step action plan on how you would execute the job.
5. LOW FRICTION CTA: Close with a friendly, low-pressure next step (e.g. "Would you be free for a quick 10-minute chat this week to discuss the details?").
6. TONE: Warm, confident, clear, human, and concise (under 250 words). Never sound like generic robotic AI boilerplate.
7. SCREENING QUESTIONS: If screening questions are provided, give direct, helpful, friendly answers tailored to each question.
"""

# Tone mappings for natural opening hooks
HOOK_TEMPLATES: Dict[str, str] = {
    "casual": "Hey there! Saw your post for '{job_title}' and had to reach out — this is right in my sweet spot.",
    "confident": "Hi! Your project for '{job_title}' caught my eye — I've built very similar solutions and would love to help you get this done smoothly.",
    "consultative": "Hi! Reading through your requirements for '{job_title}', you're looking for someone who can step in, take ownership, and deliver high quality from day one.",
    "concise": "Hi! I specialize in {skills} and can deliver '{job_title}' cleanly, quickly, and to your exact specifications.",
    "technical": "Hi! Your requirements for '{job_title}' match my technical stack ({skills}) closely — especially around building reliable, maintainable systems."
}


def _generate_hook(tone: str, job_title: str, skills_str: str) -> str:
    """Generates an opening hook according to the requested tone."""
    template = HOOK_TEMPLATES.get(tone.lower(), HOOK_TEMPLATES["confident"])
    return template.format(job_title=job_title, skills=skills_str)


def generate_heuristic_proposal(
    request: ProposalGenerateRequest,
    profile: ProfileBase
) -> ProposalGenerateResponse:
    """
    Creates a friendly, human, and high-converting Upwork proposal using
    verified profile skills, portfolio items, and the client's job requirements.

    Args:
        request (ProposalGenerateRequest): Target job details and tone instructions.
        profile (ProfileBase): The matched candidate profile.

    Returns:
        ProposalGenerateResponse: Complete proposal object and screening answers.
    """
    skills_sample = ", ".join(profile.skills[:4]) if profile.skills else "modern software development"
    tone = request.tone or "confident"

    # 1. Warm, conversational hook
    hook = _generate_hook(tone, request.job_title, skills_sample)

    # 2. Authentic portfolio & credibility proof
    portfolio_highlight = ""
    top_project_title = ""
    if profile.portfolio_items and len(profile.portfolio_items) > 0:
        top_project = profile.portfolio_items[0]
        top_project_title = top_project.get("title", "a similar project")
        p_desc = top_project.get("description", "")
        portfolio_highlight = f"For example, on a recent project ({top_project_title}), I solved a very similar challenge: {p_desc}"

    # Social proof & agency credibility
    credibility_tag = ""
    if getattr(profile, "agency", None):
        agency_info = profile.agency
        if getattr(profile, "job_success_score", None):
            agency_info += f" ({profile.job_success_score})"
        credibility_tag = f" with {agency_info}"

    testimonial_callout = ""
    if getattr(profile, "testimonials", None) and len(profile.testimonials) > 0:
        first_t = profile.testimonials[0]
        c_name = first_t.get("client_name", "Recent Client")
        c_quote = first_t.get("quote", "").strip()
        if c_quote:
            short_q = (c_quote[:130] + "...") if len(c_quote) > 130 else c_quote
            testimonial_callout = f'\nWhat past clients say: "{short_q}" — {c_name}'

    # 3. Assemble human, clean body sections
    body_paragraphs = [
        hook,
        f"\nAs an AI & Automation Engineer{credibility_tag}, I specialize in {skills_sample}. {portfolio_highlight}{testimonial_callout}",
        (
            "\nHere is how I would help you tackle this:\n"
            "1. Clarify & Align: Review your goals and requirements so we're 100% aligned on scope and milestones.\n"
            "2. Build & Iterate: Develop clean, well-tested solutions with regular updates so you're always in the loop.\n"
            "3. Polish & Launch: Thorough testing, smooth handoff, and support to ensure everything runs flawlessly."
        ),
        f"Would you be open to a quick 10-minute chat this week to discuss the details? Happy to answer any questions!\n\nBest regards,\n{profile.name}"
    ]

    proposal_text = "\n".join(body_paragraphs)

    # 4. Natural answers to screening questions
    screening_answers = []
    if request.screening_questions:
        for q in request.screening_questions:
            q_clean = q.strip()
            if not q_clean:
                continue
            q_lower = q_clean.lower()
            if any(w in q_lower for w in ["link", "portfolio", "sample", "github", "url"]):
                ans = (
                    f"Yes! I have extensive hands-on experience in this domain. Recent work includes "
                    f"'{top_project_title or 'similar client implementations'}' utilizing {skills_sample}. "
                    f"I'd be glad to share relevant code samples and walk you through live demos during our call."
                )
            elif any(w in q_lower for w in ["experience", "previously", "built", "worked with", "have you"]):
                ans = (
                    f"Yes, absolutely. As a {profile.title}, I regularly build production-ready solutions with {skills_sample}. "
                    f"I have tackled similar technical requirements before and can bring that proven experience directly to your project."
                )
            else:
                ans = (
                    f"Yes, definitely. With my background in {skills_sample}, I am confident in handling this effectively. "
                    f"I focus on clean execution, proactive communication, and delivering reliable results on schedule."
                )
            screening_answers.append(ScreeningAnswer(question=q_clean, answer=ans))

    return ProposalGenerateResponse(
        proposal=proposal_text,
        hook=hook,
        solution_summary="Tailored strategy and execution plan based on candidate's proven experience.",
        call_to_action="Would you be open to a quick 10-minute chat this week to discuss the details?",
        screening_answers=screening_answers,
        model_used="Smart AI Proposal Assistant"
    )


def generate_upwork_proposal(
    request: ProposalGenerateRequest,
    profile: ProfileBase
) -> ProposalGenerateResponse:
    """
    Generates a natural Upwork proposal using the Hugging Face Free Inference API,
    falling back to the friendly heuristic engine if unconfigured or unavailable.

    Args:
        request (ProposalGenerateRequest): Target job and tone parameters.
        profile (ProfileBase): The matched candidate profile.

    Returns:
        ProposalGenerateResponse: Generated proposal and structured metadata.
    """
    if not settings.HF_TOKEN:
        logger.info("HF_TOKEN not set; utilizing heuristic proposal engine.")
        return generate_heuristic_proposal(request, profile)

    try:
        from huggingface_hub import InferenceClient
        client = InferenceClient(token=settings.HF_TOKEN)

        agency_str = f"{profile.agency} ({profile.job_success_score})" if getattr(profile, "agency", None) else ""
        profile_context = (
            f"Freelancer Name: {profile.name}\n"
            f"Headline: {profile.title}\n"
            f"Hourly Rate: ${profile.hourly_rate}/hr\n"
            f"Location: {getattr(profile, 'location', '')}\n"
            f"Agency & JSS: {agency_str}\n"
            f"Skills: {', '.join(profile.skills)}\n"
            f"Bio: {profile.bio}\n"
            f"Certifications: {json.dumps(getattr(profile, 'certifications', []))}\n"
            f"Client Endorsements / Testimonials: {json.dumps(getattr(profile, 'testimonials', []))}\n"
            f"Portfolio: {json.dumps(profile.portfolio_items)}\n"
        )

        job_context = (
            f"Job Title: {request.job_title}\n"
            f"Job Description: {request.job_description}\n"
            f"Requested Tone: {request.tone}\n"
        )
        if request.screening_questions:
            job_context += "Screening Questions:\n" + "\n".join(
                f"{i+1}. {q}" for i, q in enumerate(request.screening_questions)
            )

        user_prompt = (
            f"{profile_context}\n\n{job_context}\n\n"
            "Write a winning Upwork proposal in a natural, friendly, human tone. Output strictly in JSON format:\n"
            "{\n"
            '  "hook": "Opening 1-2 punchy lines",\n'
            '  "proposal": "Complete proposal text",\n'
            '  "screening_answers": [\n'
            '    {"question": "question text", "answer": "friendly, direct answer based on background"}\n'
            "  ]\n"
            "}"
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        logger.info(f"Dispatching proposal generation request to Hugging Face: {settings.HF_GENERATION_MODEL}")
        response = client.chat.completions.create(
            model=settings.HF_GENERATION_MODEL,
            messages=messages,
            max_tokens=900,
            temperature=0.7
        )

        raw_output = response.choices[0].message.content or ""

        # Extract JSON using regular expressions
        json_match = re.search(r"\{.*\}", raw_output, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group(0))
                answers = [
                    ScreeningAnswer(
                        question=str(item.get("question", "")),
                        answer=str(item.get("answer", ""))
                    )
                    for item in data.get("screening_answers", [])
                ]
                return ProposalGenerateResponse(
                    proposal=data.get("proposal", raw_output),
                    hook=data.get("hook", ""),
                    solution_summary="AI-synthesized custom solution proposal",
                    call_to_action="Friendly discovery call pitch included in proposal.",
                    screening_answers=answers,
                    model_used=settings.HF_GENERATION_MODEL
                )
            except Exception as parse_err:
                logger.warning(f"Failed to parse LLM JSON response: {parse_err}")

        # Fallback to plain text if JSON formatting failed
        return ProposalGenerateResponse(
            proposal=raw_output,
            hook=raw_output.split("\n")[0] if raw_output else "",
            screening_answers=[],
            model_used=settings.HF_GENERATION_MODEL
        )

    except Exception as e:
        logger.error(f"Hugging Face proposal inference error: {e}. Falling back to heuristic engine.")
        return generate_heuristic_proposal(request, profile)
