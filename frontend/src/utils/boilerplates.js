export const CPP_CP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    
}`;

export const DEFAULT_BOILERPLATES = {
  cpp: CPP_CP_TEMPLATE,
  javascript: `// JavaScript (Node.js) Starter Template
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on('line', (line) => {
    // Process input
});`,
  python: `# Python 3 Starter Template
import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

if __name__ == '__main__':
    main()`,
  java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        FastScanner fs = new FastScanner();
        // Read input
    }
    
    static class FastScanner {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer("");
        String next() {
            while (!st.hasMoreTokens()) {
                try { st = new StringTokenizer(br.readLine()); } catch (Exception e) {}
            }
            return st.nextToken();
        }
        int nextInt() { return Integer.parseInt(next()); }
    }
}`
};

export function getBoilerplate(lang) {
  return DEFAULT_BOILERPLATES[lang] || DEFAULT_BOILERPLATES.cpp;
}
