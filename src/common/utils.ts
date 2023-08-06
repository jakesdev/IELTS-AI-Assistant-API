import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
    return bcrypt.hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
    if (!password || !hash) {
        return Promise.resolve(false);
    }

    return bcrypt.compare(password, hash);
}

export function getVariableName<TResult>(getVar: () => TResult): string {
    const m = /\(\)=>(.*)/.exec(getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, ''));

    if (!m) {
        throw new Error("The function does not contain a statement matching 'return variableName;'");
    }

    const fullMemberName = m[1];

    const memberParts = fullMemberName.split('.');

    return memberParts[memberParts.length - 1];
}

export function isUrlValid(url: string) {
    const res = url.match(/^https?:\/\/.+\.([^/]+)\/.*/);

    return res == null ? false : true;
}

interface IOrder {
    order: number;
}

export function preloadNewOrder(T: IOrder[], currentOrder: number, newIndex: number) {
    if (newIndex >= T.length) {
        throw new BadRequestException(`INDEX_MUST_BE_LESS_THAN_ARRAY_LENGTH`);
    }

    // move to the first
    if (newIndex === 0) {
        return Number(T[newIndex].order) / 2;
    }

    // move to the end
    if (newIndex === T.length - 1) {
        return Number(T[T.length - 1].order) + 1;
    }

    // move forward
    if (currentOrder < Number(T[newIndex].order)) {
        const previousOrder = Number(T[newIndex].order);
        const nextOrder = Number(T[newIndex + 1].order);

        return (previousOrder + nextOrder) / 2;
    }

    // move back
    if (currentOrder > Number(T[newIndex].order)) {
        const previousOrder = Number(T[newIndex - 1].order);
        const nextOrder = Number(T[newIndex].order);

        return (previousOrder + nextOrder) / 2;
    }
}
