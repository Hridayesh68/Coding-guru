// ─────────────────────────────────────────────────
// Minimal starter-code boilerplates for supported languages:
// C++, Java, Python.
// Every language follows standard competitive programming convention:
// Read input (integer or string) from STDIN, write to STDOUT.
// ─────────────────────────────────────────────────

export const DEFAULT_BOILERPLATES = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input (integer or string) from standard input
    

    return 0;
}`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Read input (integer or string) from standard input

    }
}`,
  python: `import sys

def solve():
    # Read input (integer or string) from standard input
    lines = sys.stdin.read().split()
    if not lines:
        return

if __name__ == '__main__':
    solve()`
};

export function getBoilerplate(lang) {
  return DEFAULT_BOILERPLATES[lang] || DEFAULT_BOILERPLATES.cpp;
}
