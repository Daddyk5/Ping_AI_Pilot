-- ping_history was replaced by ping_runs + ping_results (202609300002). Nothing reads or
-- writes it any more. Its legacy rows had no owner and were already removed in 202609300001.
drop table if exists public.ping_history;
