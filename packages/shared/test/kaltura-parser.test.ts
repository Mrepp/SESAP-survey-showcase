import { describe, it, expect } from 'vitest';
import { parseKalturaSource, parseVideoEmbed, ValidationError } from '../src';

describe('parseKalturaSource', () => {
  it('parses a bare entry id', () => {
    const result = parseKalturaSource('1_oixah593');
    expect(result.entryId).toBe('1_oixah593');
    expect(result.partnerId).toBeUndefined();
  });

  it('parses an OSU media page URL', () => {
    const result = parseKalturaSource(
      'https://media.oregonstate.edu/media/t/1_oixah593/372803202',
    );
    expect(result.entryId).toBe('1_oixah593');
  });

  it('parses an iframe embed with partnerId and widgetId', () => {
    const iframe = `<iframe id="kaltura_player" src='https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/55338833?iframeembed=true&amp;entry_id=1_oixah593&amp;config%5Bprovider%5D=%7B%22widgetId%22%3A%221_gv233sh4%22%7D&amp;config%5Bplayback%5D=%7B%22startTime%22%3A0%7D'></iframe>`;
    const result = parseKalturaSource(iframe);
    expect(result.entryId).toBe('1_oixah593');
    expect(result.partnerId).toBe('391241');
    expect(result.widgetId).toBe('1_gv233sh4');
  });

  it('parses a direct CDN URL with query params', () => {
    const url =
      'https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/55338833?entry_id=1_abc12345';
    const result = parseKalturaSource(url);
    expect(result.entryId).toBe('1_abc12345');
    expect(result.partnerId).toBe('391241');
  });

  it('throws ValidationError for empty input', () => {
    expect(() => parseKalturaSource('   ')).toThrow(ValidationError);
  });

  it('throws ValidationError when no entry id can be extracted', () => {
    expect(() => parseKalturaSource('https://example.com/no-kaltura-here')).toThrow(
      ValidationError,
    );
  });

  it('handles double-quoted iframe src', () => {
    const iframe = `<iframe src="https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/55338833?entry_id=1_xyz98765"></iframe>`;
    const result = parseKalturaSource(iframe);
    expect(result.entryId).toBe('1_xyz98765');
    expect(result.partnerId).toBe('391241');
  });
});

describe('parseVideoEmbed', () => {
  it('normalizes a Kaltura iframe to a public embed URL', () => {
    const iframe = `<iframe src='https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/55338833?entry_id=1_oixah593&amp;config%5Bprovider%5D=%7B%22widgetId%22%3A%221_gv233sh4%22%7D'></iframe>`;
    const result = parseVideoEmbed(iframe);
    expect(result.provider).toBe('kaltura');
    expect(result.entryId).toBe('1_oixah593');
    expect(result.partnerId).toBe('391241');
    expect(result.widgetId).toBe('1_gv233sh4');
    expect(result.embedUrl).toContain('/p/391241/embedPlaykitJs/uiconf_id/55338833');
    expect(result.embedUrl).toContain('entry_id=1_oixah593');
  });

  it('normalizes YouTube watch URLs to privacy-enhanced embeds', () => {
    const result = parseVideoEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.provider).toBe('youtube');
    expect(result.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('normalizes Vimeo URLs to player embeds', () => {
    const result = parseVideoEmbed('https://vimeo.com/123456789');
    expect(result.provider).toBe('vimeo');
    expect(result.embedUrl).toBe('https://player.vimeo.com/video/123456789');
  });

  it('accepts generic HTTPS iframe sources without returning raw HTML', () => {
    const result = parseVideoEmbed('<iframe src="https://example.edu/embed/video"></iframe>');
    expect(result.provider).toBe('iframe');
    expect(result.embedUrl).toBe('https://example.edu/embed/video');
  });

  it('rejects non-HTTPS generic iframe sources', () => {
    expect(() => parseVideoEmbed('<iframe src="http://example.edu/embed/video"></iframe>')).toThrow(
      ValidationError,
    );
  });
});
