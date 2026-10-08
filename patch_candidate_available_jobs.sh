awk '
  /useEffect/ {
    in_use_effect = 1
    use_effect_lines = ""
  }
  in_use_effect {
    use_effect_lines = use_effect_lines $0 "\n"
    if (/} *, *\[/) {
      # This is the end of useEffect
      # But we want to print fetchJobs first! So we wait.
    }
  }
'
