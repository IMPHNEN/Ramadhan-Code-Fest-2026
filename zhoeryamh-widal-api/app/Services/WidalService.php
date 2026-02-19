<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class WidalService
{
    protected array $map;
    protected array $mapReverse;
    protected array $mapDecode;
    protected array $vowelShort;
    protected array $digraphs = ['NG', 'NY', 'EU'];
    protected array $vowels   = ['A', 'I', 'U', 'E', 'É', 'EU', 'O'];

    protected bool $enableLog = false;

    public function __construct()
    {
        $this->map = [
            'A'  => 'NYA',
            'B'  => 'H',
            'C'  => 'J',
            'D'  => 'P',
            'E'  => 'NYE',
            'F'  => 'D',
            'G'  => 'S',
            'H'  => 'B',
            'I'  => 'NYI',
            'J'  => 'C',
            'K'  => 'N',
            'L'  => 'R',
            'M'  => 'Y',
            'N'  => 'K',
            'O'  => 'NYO',
            'P'  => 'D',
            'Q'  => 'N',
            'R'  => 'L',
            'S'  => 'G',
            'T'  => 'W',
            'U'  => 'NYU',
            'V'  => 'D',
            'W'  => 'T',
            'X'  => 'N',
            'Y'  => 'M',
            'Z'  => 'C',
            'NG' => 'NY',
            'NY' => 'NG',
            'É'  => 'NYÉ',
            'EU' => 'NYEU',
        ];

        $this->mapReverse = [
            'A'  => 'NYA',
            'B'  => 'H',
            'C'  => 'J',
            'D'  => 'P',
            'E'  => 'NYE',
            'F'  => 'D',
            'G'  => 'S',
            'H'  => 'B',
            'I'  => 'NYI',
            'J'  => 'C',
            'K'  => 'N',
            'L'  => 'R',
            'M'  => 'Y',
            'N'  => 'K',
            'O'  => 'NYO',
            'P'  => 'D',
            'Q'  => 'N',
            'R'  => 'L',
            'S'  => 'G',
            'T'  => 'W',
            'U'  => 'NYU',
            'V'  => 'D',
            'W'  => 'T',
            'X'  => 'N',
            'Y'  => 'M',
            'Z'  => 'C',
            'NG' => '(NY)',
            'NY' => '(NG)',
            'É'  => 'NYÉ',
            'EU' => 'NYEU',
        ];

        $this->mapDecode = [
            'NYA'    => 'A',
            'H'      => 'B',
            'J'      => 'C',
            'P'      => 'D',
            'NYE'    => 'E',
            'D'      => 'P',
            'S'      => 'G',
            'B'      => 'H',
            'NYI'    => 'I',
            'C'      => 'J',
            'N'      => 'K',
            'R'      => 'L',
            'Y'      => 'M',
            'K'      => 'N',
            'NYO'    => 'O',
            'L'      => 'R',
            'G'      => 'S',
            'W'      => 'T',
            'NYU'    => 'U',
            'T'      => 'W',
            'M'      => 'Y',
            'NY'     => 'NG',
            'NG'     => 'NY',
            'NYÉ'    => 'É',
            'NYEU'   => 'EU',
            '(NYA)'  => 'NGA',
            '(NYI)'  => 'NGI',
            '(NYU)'  => 'NGU',
            '(NYE)'  => 'NGE',
            '(NYÉ)'  => 'NGÉ',
            '(NYO)'  => 'NGO',
            '(NYEU)' => 'NGEU',
            '(NY)'   => 'NG',
            '(NG)'   => 'NY',
            'NGA'    => 'NYA',
            'NGI'    => 'NYI',
            'NGU'    => 'NYU',
            'NGE'    => 'NYE',
            'NGÉ'    => 'NYÉ',
            'NGO'    => 'NYO',
            'NGEU'   => 'NYEU',
        ];

        $this->vowelShort = [
            'NYA'  => 'A',
            'NYI'  => 'I',
            'NYU'  => 'U',
            'NYE'  => 'E',
            'NYÉ'  => 'É',
            'NYO'  => 'O',
            'NYEU' => 'EU',
        ];
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    public function encode(string $input, bool $reversal = false): string
    {
        if (function_exists('Normalizer::normalize')) {
            $input = \Normalizer::normalize($input, \Normalizer::FORM_C);
        }

        $original = mb_strtoupper($input, 'UTF-8');
        $tokens   = $this->tokenizeDigraphsAndAccents($original);
        $parts    = [];

        foreach ($tokens as $key => $token) {
            if (! isset($this->map[$token]) || ! isset($this->mapReverse[$token])) {
                $parts[] = $token;
                continue;
            }

            $mapped = $reversal ? $this->mapReverse[$token] : $this->map[$token];

            if ($this->isVowelToken($token)) {
                if ($this->isWordStart($tokens, $key)) {
                    $parts[] = 'NY';
                    $parts[] = $this->vowelShort[$mapped] ?? $mapped;
                    continue;
                }

                $prev = $tokens[$key - 1];
                if ($this->isVowelToken($prev)) {
                    $parts[] = $mapped;
                    continue;
                }

                $parts[] = $this->vowelShort[$mapped] ?? $mapped;
                continue;
            }

            $parts[] = $mapped;
        }

        $output = implode('', $parts);
        $output = str_replace('NYNY', 'NY', $output);

        return mb_strtolower($output, 'UTF-8');
    }

    public function decode(string $input): string
    {
        if (function_exists('Normalizer::normalize')) {
            $input = \Normalizer::normalize($input, \Normalizer::FORM_C);
        }

        $string  = mb_strtoupper($input, 'UTF-8');
        $tokens  = $this->tokenizeForDecode($string);
        $decoded = [];

        foreach ($tokens as $token) {
            $decoded[] = $this->mapDecode[$token] ?? $token;
        }

        return mb_strtolower(implode('', $decoded), 'UTF-8');
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    protected function tokenizeDigraphsAndAccents(string $string): array
    {
        $tokens = [];
        $index  = 0;
        $length = mb_strlen($string, 'UTF-8');

        while ($index < $length) {
            $two = mb_substr($string, $index, 2, 'UTF-8');

            if (in_array($two, $this->digraphs, true)) {
                $tokens[] = $two;
                $index += 2;
                continue;
            }

            $tokens[] = mb_substr($string, $index, 1, 'UTF-8');
            $index += 1;
        }

        return $tokens;
    }

    protected function tokenizeForDecode(string $string): array
    {
        $tokens     = [];
        $index      = 0;
        $length     = mb_strlen($string, 'UTF-8');
        $nyPatterns = [
            '(NYEU)', '(NYÉ)', '(NYA)', '(NYE)', '(NYI)', '(NYO)', '(NYU)', '(NY)', '(NG)',
            'NYEU', 'NYÉ', 'NYA', 'NYE', 'NYI', 'NYO', 'NYU',
            'NGEU', 'NGÉ', 'NGA', 'NGE', 'NGI', 'NGO', 'NGU',
        ];

        while ($index < $length) {
            $matched = false;

            foreach ($nyPatterns as $pattern) {
                $len = mb_strlen($pattern, 'UTF-8');

                if (mb_substr($string, $index, $len, 'UTF-8') === $pattern) {
                    $tokens[] = $pattern;
                    $index += $len;
                    $matched = true;
                    break;
                }
            }

            if ($matched) continue;

            if (mb_substr($string, $index, 2, 'UTF-8') === 'NY') {
                $tokens[] = 'NY';
                $index += 2;
                continue;
            }

            if (mb_substr($string, $index, 2, 'UTF-8') === 'NG') {
                $tokens[] = 'NG';
                $index += 2;
                continue;
            }

            $tokens[] = mb_substr($string, $index, 1, 'UTF-8');
            $index += 1;
        }

        return $tokens;
    }

    protected function isVowelToken(string $t): bool
    {
        return in_array($t, $this->vowels, true);
    }

    protected function isWordStart(array $tokens, int $i): bool
    {
        if ($i === 0) return true;
        return preg_match('/\p{L}/u', $tokens[$i - 1]) !== 1;
    }
}
