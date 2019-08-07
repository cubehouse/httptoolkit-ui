import * as _ from 'lodash';
import { MockRuleData, matchers } from "mockttp";

import { MatcherClass } from "../rules";
import { WildcardMatcher, DefaultWildcardMatcher, MethodMatchers } from './rule-definitions';

function withFirstCharUppercased(input: string): string {
    return input[0].toUpperCase() + input.slice(1);
}

// Summarize a single type of matcher (for listing matcher options)
export function summarizeMatcherClass(matcher: MatcherClass): string | undefined {
    switch (matcher) {
        case WildcardMatcher:
        case DefaultWildcardMatcher:
        case matchers.WildcardMatcher:
            return "Any requests";
        case matchers.MethodMatcher:
            return "Requests using method";
        case matchers.SimplePathMatcher:
            return "For URL";
        case matchers.RegexPathMatcher:
            return "For URLs matching";
        case matchers.QueryMatcher:
            return "With query parameters";
        case matchers.HeaderMatcher:
            return "Including headers";
        case matchers.CookieMatcher:
            return "With cookie";
        case matchers.RawBodyMatcher:
            return "With body";
        case matchers.FormDataMatcher:
            return "With form data";
        case matchers.JsonBodyMatcher:
            return "With JSON body";
        case matchers.JsonBodyFlexibleMatcher:
            return "With JSON body matching";
    }

    // One case to catch the various specific method matchers
    const method = _.findKey(MethodMatchers, m => m === matcher);
    if (method) {
        return `${method} requests`;
    }

    // For anything unknown
    return undefined;
};

// Summarize the matchers of an instantiated rule
// Slight varation on the Mockttp explanation to make the
// comma positioning more consistent for UX of changing rules
export function summarizeMatcher(rule: MockRuleData): string {
    const { matchers } = rule;

    if (matchers.length === 0) return 'Never';
    if (matchers.length === 1) return matchers[0].explain();
    if (matchers.length === 2) {
        // With just two explanations you can just combine them
        return `${matchers[0].explain()} ${matchers[1].explain()}`;
    }

    // With 3+, we need to oxford comma separate the later
    // explanations, to make them readable
    return matchers[0].explain() + ' ' +
        matchers.slice(1, -1)
        .map((m) => m.explain())
        .join(', ') + ', and ' + matchers.slice(-1)[0].explain();
}

// Summarize the action of an instantiated rule
export function summarizeAction(rule: MockRuleData): string {
    return withFirstCharUppercased(rule.handler.explain());
}