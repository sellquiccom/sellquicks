
export function generateOrderCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Add a dash for readability, e.g., ABC-DEF
    if (length > 4) {
        const mid = Math.floor(length / 2);
        result = result.substring(0, mid) + '-' + result.substring(mid);
    }
    return result;
}

    