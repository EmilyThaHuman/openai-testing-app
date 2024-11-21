-- Insert sample avatars
INSERT INTO storage.objects (bucket_id, name, owner, size, metadata) VALUES
('avatars', 'default-avatar-1.png', 'system', 12345, '{"contentType": "image/png"}'),
('avatars', 'default-avatar-2.png', 'system', 12345, '{"contentType": "image/png"}'),
('avatars', 'default-avatar-3.png', 'system', 12345, '{"contentType": "image/png"}'),
('avatars', 'default-avatar-4.png', 'system', 12345, '{"contentType": "image/png"}');

-- Insert sample workspace files
INSERT INTO storage.objects (bucket_id, name, owner, size, metadata) VALUES
('workspace-files', 'example-react-component.jsx', 'system', 2048, '{"contentType": "text/javascript"}'),
('workspace-files', 'api-example.js', 'system', 1536, '{"contentType": "text/javascript"}'),
('workspace-files', 'readme.md', 'system', 512, '{"contentType": "text/markdown"}'),
('workspace-files', 'config.json', 'system', 256, '{"contentType": "application/json"}');

-- Insert sample chat attachments
INSERT INTO storage.objects (bucket_id, name, owner, size, metadata) VALUES
('chat-attachments', 'code-snippet-1.js', 'system', 1024, '{"contentType": "text/javascript"}'),
('chat-attachments', 'api-response.json', 'system', 2048, '{"contentType": "application/json"}'),
('chat-attachments', 'error-log.txt', 'system', 512, '{"contentType": "text/plain"}'); 