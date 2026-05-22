-- 016_facebook_template_platform.sql
-- Разрешить платформу 'facebook' в шаблонах SMM (был CHECK только telegram/instagram).

ALTER TABLE social_templates DROP CONSTRAINT IF EXISTS social_templates_platform_check;
ALTER TABLE social_templates
  ADD CONSTRAINT social_templates_platform_check
  CHECK (platform IN ('telegram', 'instagram', 'facebook'));
